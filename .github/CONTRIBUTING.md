# Contributing

Thank you for your interest in contributing to Inertia.js. We’re excited to have your help in making this project better for everyone.

## Project Overview

Inertia.js is a monorepo powered by [pnpm workspaces](https://pnpm.io/workspaces). Here's how everything fits together:

```
inertia/
├── packages/          Core Inertia.js packages
│   ├── core/          Framework-agnostic library
│   ├── react/         React adapter
│   │   └── test-app/  React test application
│   ├── svelte/        Svelte adapter
│   │   └── test-app/  Svelte test application
│   └── vue3/          Vue 3 adapter
│       └── test-app/  Vue 3 test application
├── playgrounds/       Full Laravel apps for manual testing
│   ├── react/         Laravel + React
│   ├── svelte4/       Laravel + Svelte 4
│   ├── svelte5/       Laravel + Svelte 5
│   └── vue3/          Laravel + Vue 3
└── tests/             End-to-end tests and test server
    ├── app/           Node.js server powering the test apps
    └── *.spec.ts      Playwright test suites
```

### Key Components

* **Test Applications:** Minimal frontend apps for automated testing (`packages/*/test-app/`).
* **Test Server:** A shared Node.js backend (`tests/app/`).
* **Playwright Tests:** Framework-agnostic E2E tests (`tests/*.spec.ts`).
* **Playgrounds:** Full Laravel apps for manual testing (`playgrounds/`).

## Getting Started

Clone the repository and install the dependencies:

```sh
git clone https://github.com/inertiajs/inertia.git inertia
cd inertia
pnpm install
```

Build all packages:

```sh
pnpm build:all
```

## Development Workflow

### Developing Packages

Run all package watchers in parallel:

```sh
pnpm dev
```

Or watch individual packages from their directory:

```sh
cd packages/react && pnpm dev
cd packages/svelte && pnpm dev
cd packages/vue3 && pnpm dev
cd packages/core && pnpm dev
```

### Running Test Applications

Start all test apps:

```sh
pnpm dev:test-app
```

Or run them individually:

```sh
pnpm dev:test-app:react
pnpm dev:test-app:svelte
pnpm dev:test-app:vue
```

Each test app runs:

* A Node.js server (auto-restarts when changed)
* A Vite watcher (rebuilds on file changes)

## Playgrounds (Optional)

> **Heads up:** Playgrounds are provided for manual exploration. They’re not required for developing or testing Inertia.js itself.

Run a playground:

```sh
pnpm dev:playground:react
pnpm dev:playground:svelte4
pnpm dev:playground:svelte5
pnpm dev:playground:vue
```

If setting up a playground for the first time:

```sh
cd playgrounds/react
composer install
cp .env.example .env
php artisan key:generate
pnpm dev:playground:react
```

Visit the app at [http://127.0.0.1:8000](http://127.0.0.1:8000).

## Running Tests

Run all tests for a specific adapter:

```sh
pnpm test:react
pnpm test:svelte
pnpm test:vue
```

Run a filtered test:

```sh
pnpm test:react -g "partial reload"
```

Run tests in headed mode:

```sh
pnpm test:vue --headed
```

Run tests in debug mode:

```sh
pnpm test:vue --debug
```

## How the Tests Work

The test setup is shared across frameworks:

```
tests/app/server.js         Shared Node.js backend
├── serves: react test app  (when PACKAGE=react)
├── serves: svelte test app (when PACKAGE=svelte)
└── serves: vue test app    (when PACKAGE=vue3)

tests/*.spec.ts             Same Playwright tests for all adapters
```

## Adding Tests for New Features

When adding a feature or fixing a bug, you must test it across all adapters.

### 1. Create Frontend Pages

Add the same page in each framework’s test app:

```
packages/react/test-app/Pages/YourFeature.jsx
packages/svelte/test-app/Pages/YourFeature.svelte
packages/vue3/test-app/Pages/YourFeature.vue
```

Each page should behave the same.

### 2. Write Playwright Tests

Add a framework-agnostic test:

```typescript
// tests/your-feature.spec.ts
import { test, expect } from '@playwright/test'

test('your feature works', async ({ page }) => {
    await page.goto('/your-feature')
    // Your assertions here
})
```

### 3. Add Backend Routes (If Needed)

If your feature needs backend routes, add them to the test server:

```javascript
// tests/app/server.js
app.get('/your-feature', (req, res) =>
  inertia.render(req, res, {
    component: 'YourFeature',
    props: { foo: 'bar' },
  }),
)
```

### 4. Run the Tests

```sh
pnpm test:react -g "your feature"
pnpm test:svelte -g "your feature"
pnpm test:vue -g "your feature"
```

All tests must pass in all frameworks.

## Publishing (For Maintainers)

1. Bump versions in `package.json` files.

2. Run `pnpm install` to update the lockfile.

3. Update the `CHANGELOG.md`.

4. Publish:

   ```sh
   pnpm publish -r
   ```

   Use `--tag=beta` for pre-releases.

5. Create a new release on [GitHub Releases](https://github.com/inertiajs/inertia/releases).