<?php

namespace App\Providers;

use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use Inertia\Ssr\SsrRenderFailed;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
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
