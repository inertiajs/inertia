<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('orders.{orderId}', function ($user, $orderId) {
    return true;
});
