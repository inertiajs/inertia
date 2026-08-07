[![Inertia.js](https://raw.githubusercontent.com/inertiajs/.github/master/banner.jpeg)](https://inertiajs.com/)

## About Inertia.js

Inertia.js lets builders ship modern single-page applications in React, Vue, or Svelte without building an API. Your backend keeps doing what it already does well: routing, controllers, models, authorization, validation. Instead of returning a template, it returns a page component with its data. Inertia connects the two halves, so a click never triggers a full page reload.

It all stays in one application: one codebase, one router, one source of truth, and the single-page experience your users expect. Fewer moving parts means fewer decisions between an idea and a production application, whether a human or an agent is writing the code.

Everything a real product needs, designed to work together:

- Page visits, [forms](https://inertiajs.com/docs/v3/the-basics/forms), file uploads with progress, and server-side validation
- [Optimistic updates](https://inertiajs.com/docs/v3/the-basics/optimistic-updates) that render before the server responds and roll back if it fails
- [Partial reloads](https://inertiajs.com/docs/v3/data-props/partial-reloads), deferred props, prefetching, polling, and infinite scroll
- [Server-side rendering](https://inertiajs.com/docs/v3/advanced/server-side-rendering), code splitting, and view transitions
- [History encryption](https://inertiajs.com/docs/v3/security/history-encryption) for pages that hold sensitive data
- [DevTools](https://inertiajs.com/docs/v3/advanced/devtools) that show every request, header, and hydrated prop while you build

## Adapters

Inertia is the layer between your backend and your frontend, and it works through adapters. It doesn't replace the frameworks you already use, on either side. The React, Vue, and Svelte adapters all live in the [inertiajs/inertia](https://github.com/inertiajs/inertia) repository. On the server, the [Laravel adapter](https://github.com/inertiajs/inertia-laravel) is officially maintained, and [community adapters](https://inertiajs.com/docs/v3/installation/community-adapters) cover Rails, Phoenix, Django, Symfony, AdonisJS, Go, .NET, and more.

Laravel's official React, Vue, and Svelte [starter kits](https://laravel.com/starter-kits) are built on Inertia. A new application begins with login, registration, password resets, email verification, two-factor authentication, and profile settings already working.

## Learning Inertia.js

The [documentation](https://inertiajs.com/docs/v3/getting-started) takes you from installation to how the protocol works under the hood. Prefer to read code? The [demo application](https://demo-v3.inertiajs.com/) is a mini CRM built with Laravel and Vue, with showcase pages for forms, navigation, data loading, prefetching, state management, and error handling. Its source is in the [demo-v3](https://github.com/inertiajs/demo-v3) repository.

## Deploying Inertia.js

An Inertia application runs anywhere your backend does. The fastest path from idea to production is [Laravel Cloud](https://cloud.laravel.com/). Connect a repository and you can deploy a app in under a minute. There are no servers to configure, and your asset build and SSR server are handled for you. Add a managed database, cache, or object storage in seconds, with the right environment variables connected for you automatically. With Flex compute, your full stack scales to zero when it's idle and wakes in under 500 milliseconds, which means staging environments and side projects cost nothing while nobody is using them. The Starter plan is $5 a month and comes with $5 in usage credits included. Try Cloud with your first month for free.

## Contributing

Thank you for considering contributing to Inertia! You can read the contribution guide [here](CONTRIBUTING.md).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

Please review [our security policy](https://github.com/inertiajs/inertia/security/policy) on how to report security vulnerabilities.

## License

Inertia is open-sourced software licensed under the [MIT license](LICENSE.md).
