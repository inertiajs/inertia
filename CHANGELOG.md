# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

For changes prior to v1.0.0, see the [legacy releases](https://legacy.inertiajs.com/releases).

## [Unreleased](https://github.com/inertiajs/inertia/compare/v1.0.6...HEAD)

- Nothing

## [v1.0.6](https://github.com/inertiajs/inertia/compare/v1.0.5...v1.0.6)

### Fixed

- Fix `usePage()` null object error in Vue 3 adapter ([#1530](https://github.com/inertiajs/inertia/pull/1530))

## [v1.0.5](https://github.com/inertiajs/inertia/compare/v1.0.4...v1.0.5)

### Fixed

- Fix `usePage()` reactivity in Vue 2 adapter ([#1527](https://github.com/inertiajs/inertia/pull/1527))

### Changed

- Simplify the Vue 2 form helper ([#1529](https://github.com/inertiajs/inertia/pull/1529))

## [v1.0.4](https://github.com/inertiajs/inertia/compare/v1.0.3...v1.0.4)

### Added

- Added `displayName` to `Link` component in React adapter ([#1512](https://github.com/inertiajs/inertia/pull/1512))

### Fixed

- Fix `usePage()` reactivity in Vue 3 adapter ([#1469](https://github.com/inertiajs/inertia/pull/1469))

## [v1.0.3](https://github.com/inertiajs/inertia/compare/v1.0.2...v1.0.3)

### Added

- Added initialization callback to form helper in Vue adapters ([#1516](https://github.com/inertiajs/inertia/pull/1516))

## [v1.0.2](https://github.com/inertiajs/inertia/compare/v1.0.1...v1.0.2)

### Fixed

- Added explicit children to `InertiaHeadProps` ([#1448](https://github.com/inertiajs/inertia/pull/1448))
- Exported `InertiaLinkProps` type ([#1450](https://github.com/inertiajs/inertia/pull/1450))
- Improved React `usePage` generic type ([#1451](https://github.com/inertiajs/inertia/pull/1451))

## [v1.0.1](https://github.com/inertiajs/inertia/compare/v1.0.0...v1.0.1)

### Fixed

- Fixed Vue type overrides for `$page` and `$inertia` ([#1393](https://github.com/inertiajs/inertia/pull/1393))
- Restored React `usePage` generic type ([#1396](https://github.com/inertiajs/inertia/pull/1396))
- Prevented need to use `Method` enum with the Link component ([#1392](https://github.com/inertiajs/inertia/pull/1392))
- Restored Vue 3 `usePage` generic type ([#1394](https://github.com/inertiajs/inertia/pull/1394))
- Fixed export of server types ([#1397](https://github.com/inertiajs/inertia/pull/1397))
- Updated form types to support nested data ([#1401](https://github.com/inertiajs/inertia/pull/1401))
- Allowed stronger type support with Vue `useForm` ([#1413](https://github.com/inertiajs/inertia/pull/1413))
- Fixed Vue 2 `setup` prop types ([#1418](https://github.com/inertiajs/inertia/pull/1418))
- Fixed issue when passing multiple children to React `Head` component ([#1433](https://github.com/inertiajs/inertia/pull/1433))

## [v1.0.0](https://github.com/inertiajs/inertia/compare/7ce91ec...v1.0.0) - 2023-01-14

### Added

- Added SSR support to Svelte library ([#1349](https://github.com/inertiajs/inertia/pull/1349))
- Added first-class TypeScript support to React adapter
- Added first-class TypeScript support to Vue 2 adapter
- Added first-class TypeScript support to Vue 3 adapter
- Added new `useForm()` hook to Vue 2 adapter ([ff59196](https://github.com/inertiajs/inertia/commit/ff59196))

### Changed

- Renamed `@inertiajs/inertia` library to `@inertiajs/core` ([#1282](https://github.com/inertiajs/inertia/pull/1282))
- Renamed `@inertiajs/inertia-react` library to `@inertiajs/react` ([#1282](https://github.com/inertiajs/inertia/pull/1282))
- Renamed `@inertiajs/inertia-svelte` library to `@inertiajs/svelte` ([#1282](https://github.com/inertiajs/inertia/pull/1282))
- Renamed `@inertiajs/inertia-vue` library to `@inertiajs/vue2` ([#1282](https://github.com/inertiajs/inertia/pull/1282))
- Renamed `@inertiajs/inertia-vue3` library to `@inertiajs/vue3` ([#1282](https://github.com/inertiajs/inertia/pull/1282))
- Merged progress library to core and deprecated `@inertiajs/progress` library ([#1282](https://github.com/inertiajs/inertia/pull/1282), [0b5f773](https://github.com/inertiajs/inertia/commit/0b5f773))
- Merged server library to core and deprecated `@inertiajs/server` library ([#1282](https://github.com/inertiajs/inertia/pull/1282))
- Renamed `Inertia` named export to `router` ([#1282](https://github.com/inertiajs/inertia/pull/1282), [e556703](https://github.com/inertiajs/inertia/commit/e556703))
- Removed deprecated named exports ([#1282](https://github.com/inertiajs/inertia/pull/1282), [e556703](https://github.com/inertiajs/inertia/commit/e556703))
- Removed deprecated `app` argument from `createInertiaApp()` in Vue adapters ([#1282](https://github.com/inertiajs/inertia/pull/1282), [65f8a5f](https://github.com/inertiajs/inertia/commit/65f8a5f))
- Updated axios to 1.x ([#1377](https://github.com/inertiajs/inertia/pull/1377))
- Simplified `usePage()` hook in Vue 3 adapter ([#1373](https://github.com/inertiajs/inertia/pull/1373))
- Improved Svelte `use:inertia` and `<Link />` component ([#1344](https://github.com/inertiajs/inertia/pull/1344))
- Removed global `visitOptions()` hook ([#1282](https://github.com/inertiajs/inertia/pull/1282), [30908c2](https://github.com/inertiajs/inertia/commit/30908c2))
- Switched bundler from Microbundle to ESbuild ([f711b46](https://github.com/inertiajs/inertia/commit/f711b46), [8093713](https://github.com/inertiajs/inertia/commit/8093713), [342312d](https://github.com/inertiajs/inertia/commit/342312d), [c9e12b3](https://github.com/inertiajs/inertia/commit/c9e12b3))

### Fixed

- Fixed `<title>` tag not always being included when a `title` callback is defined in `createInertiaApp()` ([#1055](https://github.com/inertiajs/inertia/pull/1055))
- Fixed types to include `undefined` as a valid `FormDataConvertable` option ([#1165](https://github.com/inertiajs/inertia/pull/1165))
- Fixed issue where remembered state wasn't clear on a full page reload ([769f643](https://github.com/inertiajs/inertia/commit/769f643))
