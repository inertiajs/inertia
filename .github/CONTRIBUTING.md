# Contributing

Thanks for your interest in contributing to Inertia.js!

## Packages

To make local Inertia.js development easier, this project has been setup as a monorepo using [pnpm](https://pnpm.io/workspaces). To set it up, start by cloning the repository on your system.

```sh
git clone https://github.com/inertiajs/inertia.git inertia
cd inertia
```

Next, install the JavaScript dependencies and build the packages:

```sh
pnpm install && pnpm build
```

If you're making changes to one of the packages, you can run the dev server to automatically rebuild the package when changes are made:

```sh
pnpm dev
```

When proposing changes to one of the adapters, please try to apply the same changes to the other adapters where possible.

## Playgrounds

It's often helpful to develop Inertia.js using a real application. The playground folder contains an example Laravel project for each of the adapters. Here's how to get a playground running:

```sh
cd playgrounds/react
pnpm build
composer install
cp .env.example .env
php artisan key:generate
php artisan serve
# visit the site at http://127.0.0.1:8000
```

Or if you prefer to watch for changes:

```sh
# in the project root
pnpm playground:react
```

To automatically see changes to the JavaScript files in the browser, start the development server:

```sh
pnpm dev
```

To test the SSR mode, first run the build, and then start the SSR server:

```sh
pnpm build
php artisan inertia:start-ssr
```

## Testing

Inertia.js uses [Playwright](https://playwright.dev/) for testing. To run the tests, use the `pnpm test` command.

## Publishing

This section is really for the benefit of the core maintainers.

1. Increment the version numbers in the `package.json` file for each package,
2. Run `pnpm install`,
3. Update `CHANGELOG.md`,
4. Run `pnpm publish -r` in the root directory. This will automatically run the necessary build steps and publish all packages. When publishing beta releases, make sure to run `pnpm publish -r --tag=beta` or `npm publish -r --tag=next` if it's `next`,
5. Add release notes to [GitHub](https://github.com/inertiajs/inertia/releases).
