# Angular playground

This is the official Laravel 13 playground for `@inertiajs/angular`. It is a standalone, strict, zoneless Angular 22 application. Inertia owns navigation, so the application intentionally has no Angular Router, Zone.js, NgModules, or Spartan NG dependency.

## Setup and development

Requirements are PHP 8.3+, Composer, a Node version supported by Angular 22, and pnpm 11.1.1+.

```sh
./init.sh
composer run dev
```

Laravel is available at <http://127.0.0.1:8000>. Angular CLI watches the browser bundle and writes deterministic assets to `public/build/angular`; Laravel continues to own the HTML document and Inertia responses.

## Production and SSR

```sh
pnpm build
php artisan inertia:start-ssr
php artisan serve
```

The browser build uses AOT and strict template checking. The SSR build uses `@inertiajs/angular/server` and emits `bootstrap/ssr/ssr.js`, the same Inertia SSR protocol used by the other official playgrounds.

The pages demonstrate navigation and page props, a persistent layout and Head, signal forms and Precognition, deferred props, polling, optimistic updates, remembered state, infinite scroll, SSR, and hydration.

Run the Laravel tests and browser/SSR smoke tests with:

```sh
php artisan test
pnpm test:browser
```
