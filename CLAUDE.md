# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Inertia.js is a framework that lets you build modern single-page React, Vue and Svelte apps using classic server-side routing and controllers. This is a monorepo containing the core library and framework adapters.

## Key Commands

### Development

- `pnpm install` - Install all dependencies
- `pnpm dev` - Build all packages and start file watchers
- `pnpm build:all` - Build all packages

### Testing

- `pnpm test:react` - Run Playwright tests for React adapter
- `pnpm test:svelte` - Run Playwright tests for Svelte adapter
- `pnpm test:vue` - Run Playwright tests for Vue adapter
- `PACKAGE=react playwright test` - Run tests directly with Playwright
- Add `-g "test name"` to filter tests by name
- Add `--headed` to see browser, `--debug` for debug mode
- Add `--webkit` to run tests in Safari/WebKit instead of Chromium

### Test Applications

- `pnpm dev:test-app` - Run all test apps simultaneously
- `pnpm dev:test-app:react` - Run React test app only
- `pnpm dev:test-app:svelte` - Run Svelte test app only
- `pnpm dev:test-app:vue` - Run Vue test app only

### Playgrounds (Laravel apps)

- `pnpm playground:react` - Run React playground
- `pnpm playground:svelte4` - Run Svelte 4 playground
- `pnpm playground:svelte5` - Run Svelte 5 playground
- `pnpm playground:vue` - Run Vue playground

## Architecture

### Repository Structure

```
inertia/
├── packages/          Core libraries and framework adapters
│   ├── core/          Framework-agnostic core library (TypeScript)
│   ├── react/         React adapter with hooks and components
│   ├── svelte/        Svelte adapter with components and stores
│   └── vue3/          Vue 3 adapter with composables
├── playgrounds/       Full Laravel applications for manual testing
├── tests/             End-to-end tests and shared Node.js backend
└── test-app/          Minimal frontend apps for automated testing
```

### Core Architecture

- **Core Library** (`packages/core`): Framework-agnostic router and request handling
- **Adapters**: Framework-specific implementations that wrap the core
- **Router**: Central class that handles navigation, requests, and page state
- **RequestStream**: Manages concurrent and synchronous requests
- **Page Management**: Handles component resolution and page transitions

### Testing Strategy

- **Shared Backend**: Single Node.js server serves all test apps (`tests/app/server.js`)
- **Framework-Agnostic Tests**: Playwright tests run against all adapters (`tests/*.spec.ts`)
- **Test Selection**: `PACKAGE` environment variable determines which adapter to test
- **Port Mapping**: React (13716), Svelte (13717), Vue (13715)

### Testing Utilities

The test suite includes several utilities in `tests/support.ts` for common testing patterns:

#### pageLoads.watch(page, maxLoads?)

Monitors page load events to ensure proper SPA behavior. Call before navigating to prevent unexpected full page reloads.

- `page`: Playwright Page object
- `maxLoads`: Expected number of loads (default: 1)
- **Usage**: `pageLoads.watch(page)` - throws error if page loads more than expected
- **Common pattern**: Call in `beforeEach` or before navigation actions

#### requests.listen(page) / requests.listenForFinished(page)

Tracks HTTP requests made during test execution for verifying request behavior.

- `requests.listen(page)`: Records all outgoing requests in `requests.requests` array
- `requests.listenForFinished(page)`: Records completed requests in `requests.finished` array
- **Usage**: Call before actions that should trigger specific requests, then assert on array contents
- **Common pattern**: Verify prefetch requests, form submissions, or API calls

#### clickAndWaitForResponse(page, buttonText, url?, element?)

Clicks an element and waits for the corresponding HTTP response, useful for testing form submissions and navigation.

- `page`: Playwright Page object
- `buttonText`: Text of the button/link to click
- `url`: Expected response URL (defaults to current page URL)
- `element`: Element type - 'link' or 'button' (default: 'link')
- **Returns**: Response object for further assertions
- **Usage**: `await clickAndWaitForResponse(page, 'Submit', '/form-endpoint', 'button')`

#### consoleMessages.listen(page)

Captures browser console messages during test execution for debugging and error detection.

- `page`: Playwright Page object
- **Usage**: `consoleMessages.listen(page)` - messages stored in `consoleMessages.messages` array
- **Common pattern**: Listen before actions that might log warnings or errors

#### shouldBeDumpPage(page, method)

Verifies that the page navigated to a dump endpoint and extracts request data for assertions.

- `page`: Playwright Page object
- `method`: Expected HTTP method ('get', 'post', 'patch', 'put', 'delete')
- **Returns**: Parsed request dump object containing form data, headers, etc.
- **Usage**: `const dump = await shouldBeDumpPage(page, 'post')` followed by assertions on dump contents
- **Common pattern**: Test form submissions and verify request data was sent correctly

## Development Guidelines

### Before Starting Any Work

1. **Check if development servers are running** with `ps aux | grep pnpm` or similar commands - `pnpm dev` and `pnpm dev:test-app` should be running (most of the time they're already running in separate windows)
2. **ALWAYS** run `pnpm build:all` to generate TypeScript files after changes
3. Verify development servers are accessible and functioning

### Code Quality Standards

1. **Align with existing codebase**: Study patterns, naming conventions, and code style
2. **Laravel elegance**: Take inspiration from Laravel's expressive, clean API design
3. **Consistency**: Ensure code, comments, naming, and tests match existing patterns
4. **Framework parity**: All features must work identically across React, Svelte, and Vue

### Making Changes

1. The core package (`packages/core`) must always be running during development
2. All adapters depend on the core library - rebuild with `pnpm build:all` after core changes
3. Changes should work consistently across React, Svelte, and Vue
4. Test across all frameworks before considering work complete

### Adding Features

1. Study existing similar features for patterns and naming conventions
2. Implement in core library if framework-agnostic
3. Add framework-specific wrappers in each adapter following existing patterns
4. Create test pages in all test apps (`packages/*/test-app/Pages/`)
5. Add backend routes if needed (`tests/app/server.js`)
6. Write Playwright tests (`tests/*.spec.ts`) that match existing test style
7. Run `pnpm build:all` to ensure TypeScript definitions are current
8. Verify behavior across all adapters with proper test commands

### File Naming Conventions

- React: `.jsx` for components, `.ts` for utilities
- Svelte: `.svelte` for components, `.ts` for utilities
- Vue: `.vue` for components, `.ts` for utilities
- Core: `.ts` for all files

### Component Structure Standards

#### Vue Components

- **Always** use `<script setup>` first, then `<template>`
- Structure: `<script setup>`, `<template>`, `<style>` (if needed)

#### React Components

- Use direct export default with inline types:

```tsx
export default ({ foo = 'default', items }: {
  foo?: string
  items?: {
    data: string[]
    next_page_url?: string
  }
}) => {
  // component logic
}
```

- **Avoid** named functions with separate interfaces:

```tsx
// ❌ Don't do this
interface PreserveUrlProps {
  foo?: string
  items?: { ... }
}
const PreserveUrl = ({ foo = 'default', items }: PreserveUrlProps) => {
```

## Important Notes

- **pnpm version 10 or higher** is required
- The project uses TypeScript throughout
- Playwright automatically builds and starts test servers
- Test apps are the primary development environment
- Playgrounds are optional Laravel apps for manual testing
- All adapters must maintain feature parity
