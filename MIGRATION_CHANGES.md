# Unhead Migration: Detailed Change List

This document provides a comprehensive list of all modifications made to the Inertia.js monorepo to implement the migration from custom DOM-diffing head management to **Unhead**.

### 1. `@inertiajs/core`
*   **Dependencies (`package.json`):**
    *   Added `unhead` and `@unhead/ssr` as dependencies.
*   **Types (`src/types.ts`):**
    *   Updated `HeadManagerOnUpdateCallback` to accept `any` instead of strictly `string[]` to support Unhead schema objects.
    *   Added `renderSSR?: () => Promise<string[]>` to the `HeadManager` interface.
    *   Updated `InertiaAppConfig` to include the `unhead` property (with an optional `disableDefaults?: boolean` and indexing for Unhead plugins/hooks).
*   **Configuration (`src/config.ts`):**
    *   Added a default `unhead: { disableDefaults: true }` object to the global configuration.
*   **Head Manager (`src/head.ts`):**
    *   Removed the legacy custom `Renderer` and string-based DOM-diffing logic.
    *   Implemented `createHeadManager` to initialize Unhead (`createHeadClient` or `createHeadServer`) using the global `unheadOptions` from config.
    *   Added a custom Unhead plugin (`inertia-unhead-compat`) via the `tags:resolve` hook to:
        *   Apply the `titleCallback` (if provided).
        *   Ensure all tags receive the `data-inertia=""` attribute.
        *   Set `tagPriority: 100` on `<title>` tags to guarantee they render last, maintaining compatibility with legacy Inertia expectations.
    *   Added the asynchronous `renderSSR()` method to extract and return head tags during server-side rendering.

### 2. `@inertiajs/react`
*   **`<Head>` Component (`src/Head.ts`):**
    *   Refactored `mapNodesToUnhead` to transform React child elements (`ReactElement`) into a structured Unhead schema object instead of serializing them to HTML strings.
    *   Ensured `<title>` tags receive the `data-inertia` attribute via the `titleAttr` property.
*   **Programmatic API (`src/useHead.ts`):**
    *   Created a new `useHead` hook that allows managing Unhead schema objects programmatically via `HeadContext`.
    *   Exported `useHead` in `src/index.ts`.
*   **App Initialization (`src/App.ts`):**
    *   Updated `InertiaAppProps` to accept a `headManager` instance.
*   **SSR (`src/createInertiaApp.ts`):**
    *   Updated the SSR factory to initialize the `ssrHeadManager` and await `headManager.renderSSR()` to inject head tags into the final HTML payload.

### 3. `@inertiajs/vue3`
*   **`<Head>` Component (`src/head.ts`):**
    *   Refactored `mapNodesToUnhead` to transform Vue `VNode` arrays into a structured Unhead schema object.
    *   Updated `renderTagChildren` to safely handle strings, numbers, and arrays of children.
    *   Ensured `<title>` tags receive the `data-inertia` attribute via the `titleAttr` property.
*   **Programmatic API (`src/useHead.ts`):**
    *   Created a new `useHead` composable that accepts raw objects, `ref`s, or reactive objects. It automatically watches for reactivity changes and cleans up on unmount.
    *   Exported `useHead` in `src/index.ts`.
*   **SSR (`src/createInertiaApp.ts`):**
    *   Imported `headManager` from the internal app scope.
    *   Updated the final SSR render block to await `headManager.renderSSR()` to inject head tags into the final HTML payload.

### 4. Tests and Build Infrastructure
*   **Core Tests (`packages/core/tests/head.test.ts`):**
    *   Refactored the XSS escaping test to use the new object-based `provider.update()` and the asynchronous `manager.renderSSR()` method.
*   **Playwright E2E Tests (`tests/head.spec.ts` & `tests/support.ts`):**
    *   Updated `getInertiaHeadHTML` helper to sort output by tag name and outer HTML. Modified tests to check for structural/functional equality rather than exact legacy string matching.
*   **Playwright Config (`playwright.config.ts`):**
    *   Fixed Windows compatibility issues in the `serveCommand` ensuring environment variables like `PACKAGE=vue3` are set correctly in `cmd.exe`.
*   **Build:**
    *   Verified and rebuilt `core`, `vue3`, `react`, and `vite` packages to ensure distribution files and type definitions are up-to-date.
