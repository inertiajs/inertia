<?php

namespace App\Providers;

use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use Inertia\ExceptionResponse;
use Inertia\Inertia;
use Inertia\Ssr\SsrRenderFailed;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Inertia::handleExceptionsUsing(function (ExceptionResponse $response) {
            if (in_array($response->statusCode(), [403, 404, 500, 503])) {
                return $response->render('ErrorPage', [
                    'status' => $response->statusCode(),
                ])->withSharedData();
            }
        });

        Event::listen(SsrRenderFailed::class, function (SsrRenderFailed $event) {
            logger()->info('SSR Error Event', [
                'component' => $event->component(),
                'url' => $event->url(),
                'error' => $event->error,
                'type' => $event->type,
                'hint' => $event->hint,
            ]);
        });
    }
}
