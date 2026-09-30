<?php

namespace App\Console\Commands;

use App\Events\ActivityLogged;
use App\Events\OrderUpdated;
use App\Support\LiveDemo;
use Illuminate\Console\Command;

class BroadcastLiveDemo extends Command
{
    protected $signature = 'live:broadcast
        {what=order : One of order, activity, both, burst or reset}
        {--times=8 : How many events a burst sends}';

    protected $description = 'Broadcast the live props demo events, so the browser can be watched without touching it';

    public function handle(): int
    {
        match ($this->argument('what')) {
            'order' => $this->order(),
            'activity' => $this->activity(),
            'both' => $this->both(),
            'burst' => $this->burst(),
            'reset' => $this->reset(),
            default => $this->fail('Unknown event. Use order, activity, both, burst or reset.'),
        };

        return self::SUCCESS;
    }

    protected function order(): void
    {
        $state = LiveDemo::advanceOrder('artisan');

        broadcast(new OrderUpdated);

        $this->info("Broadcast OrderUpdated, the order is now {$state['order']['status']}.");
    }

    protected function activity(): void
    {
        LiveDemo::logActivity('Logged from the terminal');

        broadcast(new ActivityLogged);

        $this->info('Broadcast ActivityLogged.');
    }

    protected function both(): void
    {
        LiveDemo::advanceOrder('artisan');
        LiveDemo::logActivity('Order and activity changed together');

        broadcast(new OrderUpdated);
        broadcast(new ActivityLogged);

        $this->info('Broadcast OrderUpdated and ActivityLogged.');
    }

    protected function burst(): void
    {
        $times = (int) $this->option('times');

        foreach (range(1, $times) as $i) {
            LiveDemo::advanceOrder("burst {$i}");

            broadcast(new OrderUpdated);

            $this->line("  sent {$i}/{$times}");

            usleep(150_000);
        }

        $this->info("Broadcast {$times} OrderUpdated events. The browser should have reloaded far fewer times.");
    }

    protected function reset(): void
    {
        LiveDemo::reset();

        broadcast(new OrderUpdated);
        broadcast(new ActivityLogged);

        $this->info('Demo reset.');
    }
}
