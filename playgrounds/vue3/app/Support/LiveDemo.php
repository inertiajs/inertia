<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;

/**
 * The state the live props demo reads from. Kept in the cache so the demo needs
 * no migrations and both browser windows see the same thing.
 */
class LiveDemo
{
    protected const KEY = 'live-demo';

    protected const STATUSES = ['pending', 'paid', 'packed', 'shipped', 'delivered'];

    public static function state(): array
    {
        return Cache::get(self::KEY, self::fresh());
    }

    public static function order(): array
    {
        return self::state()['order'];
    }

    public static function stats(): array
    {
        return self::state()['stats'];
    }

    public static function activity(): array
    {
        return self::state()['activity'];
    }

    public static function advanceOrder(string $by): array
    {
        $state = self::state();
        $current = array_search($state['order']['status'], self::STATUSES, true);

        $state['order']['status'] = self::STATUSES[($current + 1) % count(self::STATUSES)];
        $state['order']['total'] = $state['order']['total'] + random_int(5, 50);
        $state['order']['updated_at'] = now()->format('H:i:s');
        $state['stats']['revenue'] = $state['stats']['revenue'] + random_int(5, 50);
        $state['stats']['orders'] = $state['stats']['orders'] + 1;

        return self::log($state, "Order advanced to {$state['order']['status']} by {$by}");
    }

    public static function logActivity(string $message): array
    {
        return self::log(self::state(), $message);
    }

    public static function reset(): array
    {
        $state = self::fresh();

        Cache::forever(self::KEY, $state);

        return $state;
    }

    protected static function log(array $state, string $message): array
    {
        $state['activity'] = array_slice([
            ['at' => now()->format('H:i:s'), 'message' => $message],
            ...$state['activity'],
        ], 0, 8);

        Cache::forever(self::KEY, $state);

        return $state;
    }

    protected static function fresh(): array
    {
        return [
            'order' => [
                'id' => 1,
                'reference' => 'ORD-1042',
                'status' => 'pending',
                'total' => 120,
                'updated_at' => now()->format('H:i:s'),
            ],
            'stats' => [
                'orders' => 1,
                'revenue' => 120,
            ],
            'activity' => [
                ['at' => now()->format('H:i:s'), 'message' => 'Demo reset'],
            ],
        ];
    }
}
