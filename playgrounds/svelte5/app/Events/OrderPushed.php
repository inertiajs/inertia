<?php

namespace App\Events;

use App\Support\LiveDemo;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Inertia\Inertia;

/**
 * The same change as [OrderUpdated], except the new prop values travel with the
 * broadcast. Every listening page writes them straight to the page, so none of
 * them asks the server for anything.
 */
class OrderPushed implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public int $orderId = 1) {}

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel("orders.{$this->orderId}");
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'orderId' => $this->orderId,
            ...Inertia::broadcastProps([
                'order' => LiveDemo::order(),
                'stats' => LiveDemo::stats(),
            ]),
        ];
    }
}
