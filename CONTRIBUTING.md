# Contributing

Thank you for your interest in contributing to Inertia.js! Your contributions help make this project better for everyone.

Inertia.js is maintained as a monorepo using [pnpm workspaces](https://pnpm.io/workspaces). Below you'll find an overview of the repository and how to get your development environment running.

> **Note:** You'll need **pnpm version 10 or higher**. If you're unsure which version you have, run `pnpm -v`.

## Repository Overview

```
inertia/
├── packages/          Core libraries and framework adapters
│   ├── core/          Framework-agnostic core library
│   ├── react/         React adapter
│   │   └── test-app/  React test application
│   ├── svelte/        Svelte adapter
│   │   └── test-app/  Svelte test application
│   └── vue3/          Vue 3 adapter
│       └── test-app/  Vue 3 test application
├── playgrounds/       Full Laravel applications for manual testing
│   ├── react/         Laravel + React
│   ├── svelte4/       Laravel + Svelte 4
│   ├── svelte5/       Laravel + Svelte 5
│   └── vue3/          Laravel + Vue 3
└── tests/             End-to-end tests and test server
    ├── app/           Shared Node.js backend
    └── *.spec.ts      Playwright test suite
```

### Key Components

- **Core Library:** The framework-agnostic engine powering all adapters (`packages/core`).
- **Adapters:** Framework-specific integrations for React, Svelte, and Vue.
- **Test Applications:** Minimal frontend apps used for automated testing (`packages/*/test-app/`).
- **Playwright Tests:** Framework-agnostic end-to-end tests that verify behavior across adapters (`tests/*.spec.ts`).
- **Playgrounds:** Full Laravel applications for manual testing (`playgrounds/`). These are optional and may eventually be removed.

## Getting Started

Clone the repository and install the dependencies:

```sh
git clone https://github.com/inertiajs/inertia.git inertia
cd inertia
pnpm install
```

Then, start the development environment:

```sh
pnpm dev
```

This builds the core library and all adapters, and starts a file watcher that will automatically rebuild each package when changes are made.

If you prefer, you can also start individual watchers from each package directory. For example:

```sh
cd packages/core && pnpm dev
cd packages/react && pnpm dev
```

> **Note:** The core package (`packages/core`) must always be running, as all adapters depend on it.

## Running Tests

Inertia.js uses Playwright to run a shared end-to-end test suite against each adapter. This is how we verify that Inertia behaves the same across React, Svelte, and Vue.

Run the test suite for a specific adapter:

```sh
pnpm test:react
pnpm test:svelte
pnpm test:vue
```

These commands automatically set a `PACKAGE` environment variable that tells the Node.js test server which adapter to serve. For example, when running `pnpm test:react`, the test server loads the React test application.

If you want to run Playwright directly, you can pass the environment variable yourself:

```sh
PACKAGE=react playwright test
```

You may filter tests by name:

```sh
pnpm test:react -g "partial reload"
```

Run tests in headed mode (to see the browser):

```sh
pnpm test:vue --headed
```

Or in debug mode:

```sh
pnpm test:vue --debug
```

### How the Test Setup Works

All adapters use the same Node.js backend and Playwright test suite. The only difference is which adapter's test app is served.

```
tests/app/server.js         Shared Node.js backend
├── serves: react test app  (when PACKAGE=react)
├── serves: svelte test app (when PACKAGE=svelte)
└── serves: vue test app    (when PACKAGE=vue3)

tests/*.spec.ts             Shared Playwright test suite
```

When running a test command, the correct adapter is selected automatically:

| Adapter | `PACKAGE` value | Test server port | App URL                                            |
| ------- | --------------- | ---------------- | -------------------------------------------------- |
| React   | `react`         | 13716            | [http://localhost:13716/](http://localhost:13716/) |
| Svelte  | `svelte`        | 13717            | [http://localhost:13717/](http://localhost:13717/) |
| Vue 3   | `vue3`          | 13715            | [http://localhost:13715/](http://localhost:13715/) |

### Automatic Test Server Boot

You do not need to start the test server manually. When you run a test, Playwright automatically builds the frontend for the selected adapter and boots the Node.js test server before running the tests. This is configured in the Playwright config (`playwright.config.ts`) using the [`webServer`](https://playwright.dev/docs/test-configuration#webserver) option. If a server is already running (for example, during local development), Playwright will reuse it.

## Running Test Applications

The test applications are the primary development environments for Inertia.js. These minimal apps cover all supported features and are used for both manual development and automated end-to-end testing.

Run all test apps at once:

```sh
pnpm dev:test-app
```

Or start an individual one:

```sh
pnpm dev:test-app:react
pnpm dev:test-app:svelte
pnpm dev:test-app:vue
```

Each test app runs two servers:

- A Node.js backend that automatically restarts when changed
- A Vite development server for the frontend

If you are developing a new feature or fixing a bug, you can use these test apps to develop and test your changes.

## Adding Tests

If you are fixing a bug, adding a feature, or improving existing functionality, please verify that your changes work across all adapters, not just one.

### 1. Add Frontend Pages

Create the same frontend page in each test application:

```
packages/react/test-app/Pages/YourFeature.jsx
packages/svelte/test-app/Pages/YourFeature.svelte
packages/vue3/test-app/Pages/YourFeature.vue
```

Each page should provide the same behavior and functionality.

### 2. Add Backend Routes (If Needed)

If your change requires a backend route, add it to the shared Node.js test server:

```javascript
// tests/app/server.js
app.get('/your-feature', (req, res) =>
  inertia.render(req, res, {
    component: 'YourFeature',
    props: { foo: 'bar' },
  }),
)
```

### 3. Write a Playwright Test

Add a new Playwright test to verify your change. Playwright allows us to test features across all adapters without duplicating test logic.

```typescript
// tests/your-feature.spec.ts
import { test, expect } from '@playwright/test'

test('your feature works', async ({ page }) => {
  await page.goto('/your-feature')
  // Your assertions here
})
```

### 4. Run the Tests in All Adapters

Be sure to run your test for each adapter:

```sh
pnpm test:react -g "your feature"
pnpm test:svelte -g "your feature"
pnpm test:vue -g "your feature"
```

Your work is not considered complete until it works consistently across all frameworks.

## Using the Playgrounds (Optional)

The repository also includes several full Laravel applications that integrate Inertia.js. These are optional and mostly useful for manually exploring how Inertia works inside a real Laravel app.

The playgrounds are provided as-is and are not part of the automated test setup. They may be removed in the future.

### Getting Started

To start a playground, simply run:

```sh
pnpm playground:react
```

The playground script will automatically handle initial setup if needed:
- Installing PHP dependencies via Composer
- Installing Node.js dependencies via pnpm
- Creating the `.env` file from `.env.example`
- Generating the application key
- Setting up the SQLite database
- Running migrations with seed data

Visit the application at [http://127.0.0.1:8000](http://127.0.0.1:8000).

Each playground has its own pnpm script:

```sh
pnpm playground:react
pnpm playground:svelte4
pnpm playground:svelte5
pnpm playground:vue
```

## Publishing (Maintainers Only)

Releasing is handled by the included release script. You'll need both the `git` CLI and the GitHub CLI ([`gh`](https://cli.github.com)) installed. To create a new release:

```sh
./release.sh
```

The script will:
- Ensure you're on the master branch with a clean working tree
- Prompt you to select the type of version bump (patch, minor, or major)
- Update all package versions automatically
- Update the lockfile
- Create a git commit and tag
- Push changes and tags to GitHub
- Create a GitHub release with auto-generated notes
- Trigger the CI publishing workflow

Publishing is handled securely using GitHub + npm [trusted publishing](https://docs.npmjs.com/trusted-publishers).
