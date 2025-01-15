# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

For changes prior to v1.0.0, see the [legacy releases](https://legacy.inertiajs.com/releases).

## [Unreleased](https://github.com/inertiajs/inertia/compare/v2.0.2...HEAD)

- Nothing yet

## [v2.0.2](https://github.com/inertiajs/inertia/compare/v2.0.1...v2.0.2)

- Fix SSR with scroll restoration ([#2190](https://github.com/inertiajs/inertia/pull/2190))
- Fix for scroll + back bug ([#2191](https://github.com/inertiajs/inertia/pull/2191))
- Backport 1.x fixes from [v1.3.0](https://github.com/inertiajs/inertia/releases/tag/v1.3.0) release ([#2193](https://github.com/inertiajs/inertia/pull/2193))

## [v2.0.1](https://github.com/inertiajs/inertia/compare/v2.0.0...v2.0.1)

- Fix playground dependencies ([#2070](https://github.com/inertiajs/inertia/pull/2070))
- Removed Vitest tests + dependencies ([#2175](https://github.com/inertiajs/inertia/pull/2175))
- Augment `vue` instead of `@vue/runtime-core` ([#2099](https://github.com/inertiajs/inertia/pull/2099))
- Fix prefetch missing `cacheFor` default value ([#2136](https://github.com/inertiajs/inertia/pull/2136))
- Fix `useForm` re-renders by memoizing functions in React [#2146](https://github.com/inertiajs/inertia/pull/2146)
- WhenVisible useEffect function is not recreated when params change. ([#2153](https://github.com/inertiajs/inertia/pull/2153))
- Ensure callback execution ([#2163](https://github.com/inertiajs/inertia/pull/2163))
- More resilient logic for stripping the origin from page URLs ([#2164](https://github.com/inertiajs/inertia/pull/2164))
- Add helper scripts for running tests ([#2173](https://github.com/inertiajs/inertia/pull/2173))
- Export `InertiaFormProps` in React ([#2161](https://github.com/inertiajs/inertia/pull/2161))
- Use default empty object in `useForm` Vue and Svelte ([#2052](https://github.com/inertiajs/inertia/pull/2052))
- Remove `data` option from `useForm` options type ([#2060](https://github.com/inertiajs/inertia/pull/2060))
- Take over scroll restoration from browser ([#2051](https://github.com/inertiajs/inertia/pull/2051))

## [v2.0.0](https://github.com/inertiajs/inertia/compare/v1.2.0...v2.0.0)

### Added

- Add polling
- Add link prefetching
- Add deferred props
- Add lazy loading of data when scrolling
- Add history encryption API
- Add React 19 support ([#2131](https://github.com/inertiajs/inertia/pull/2131))
- Add client side visits ([#2130](https://github.com/inertiajs/inertia/pull/2130))

### Changed

- Removal of NProgress dependency ([#2045](https://github.com/inertiajs/inertia/pull/2045))
- Change TypeScript module resolution in the Svelte adapter ([#2035](https://github.com/inertiajs/inertia/pull/2035))
- Refactor `createInertiaApp` in Svelte adapter ([#2036](https://github.com/inertiajs/inertia/pull/2036))

### Fixed

- Fix: make Link href prop reactive ([#2089](https://github.com/inertiajs/inertia/pull/2089))

## [v1.3.0](https://github.com/inertiajs/inertia/compare/v1.2.0...v1.3.0)

### Added

- Add React 19 support ([#2121](https://github.com/inertiajs/inertia/pull/2121))
- Add Svelte 5 support ([#1970](https://github.com/inertiajs/inertia/pull/1970))
- Add TypeScript support to Svelte adapter ([#1866](https://github.com/inertiajs/inertia/pull/1866), [69292e](https://github.com/inertiajs/inertia/commit/69292ef3592ccca5e0f05f7ce131a53f6c1ba22b), [#2003](https://github.com/inertiajs/inertia/pull/2003), [#2005](https://github.com/inertiajs/inertia/pull/2005))

### Changed

- Skip intercepting non-left button clicks on links ([#1908](https://github.com/inertiajs/inertia/pull/1908), [#1910](https://github.com/inertiajs/inertia/pull/1910))
- Changed `preserveScroll` to be `true` on initial page visit ([#1360](https://github.com/inertiajs/inertia/pull/1360))
- Return early when using `router.on()` during SSR ([#1715](https://github.com/inertiajs/inertia/pull/1715))
- Use updater function in `setData` in `useForm` hook in React adapter ([#1859](https://github.com/inertiajs/inertia/pull/1859))

### Fixed

- Fix history navigation issue on Chrome iOS ([#1984](https://github.com/inertiajs/inertia/pull/1984), [#1992](https://github.com/inertiajs/inertia/pull/1992))
- Fix `setNavigationType` for Safari 10 ([#1957](https://github.com/inertiajs/inertia/pull/1957))
- Export `InertiaFormProps` in all adapters ([#1596](https://github.com/inertiajs/inertia/pull/1596), [#1734](https://github.com/inertiajs/inertia/pull/1734))
- Fix `isDirty` after `form.defaults()` call in Vue 3 ([#1985](https://github.com/inertiajs/inertia/pull/1985))
- Fix scroll reset on page navigation ([#1980](https://github.com/inertiajs/inertia/pull/1980))
- Fix scroll position restoration for `[scroll-region]` elements ([#1782](https://github.com/inertiajs/inertia/pull/1782), [#1980](https://github.com/inertiajs/inertia/pull/1980))
- Fix `useForm` re-renders by memoizing functions in React adapter ([#1607](https://github.com/inertiajs/inertia/pull/1607))
- Fix doubling hash when using `<React.StrictMode>` ([#1728](https://github.com/inertiajs/inertia/pull/1728))
- Fix type augmentation in Vue 3 adapter ([#1958](https://github.com/inertiajs/inertia/pull/1958))
- Fix form helper `transform` return type in React adapter ([#1896](https://github.com/inertiajs/inertia/pull/1896))
- Fix props reactivity in Svelte adapter ([#1969](https://github.com/inertiajs/inertia/pull/1969))
- Fix `<Render />` component to respect `preserveState` option in Svelte adapter ([#1943](https://github.com/inertiajs/inertia/pull/1943))
- Fix 'received an unexpected slot "default"' warning in Svelte adapter ([#1941](https://github.com/inertiajs/inertia/pull/1941))
- Fix command + click behavior on links in React adapter ([#2132](https://github.com/inertiajs/inertia/pull/2132))
- Fix import in Svelte adapter ([#2002](https://github.com/inertiajs/inertia/pull/2002))

## [v1.2.0](https://github.com/inertiajs/inertia/compare/v1.1.0...v1.2.0)

- Fix `preserveScroll` and `preserveState` types ([#1882](https://github.com/inertiajs/inertia/pull/1882))
- Revert "merge props from partial reloads" ([#1895](https://github.com/inertiajs/inertia/pull/1895))

## [v1.1.0](https://github.com/inertiajs/inertia/compare/v1.0.16...v1.1.0)

- Add new `except` visit option to exclude props from partial reloads ([#1876](https://github.com/inertiajs/inertia/pull/1876))
- Deep merge props from partial reloads ([#1877](https://github.com/inertiajs/inertia/pull/1877))

## [v1.0.16](https://github.com/inertiajs/inertia/compare/v1.0.15...v1.0.16)

- Fix Svelte 4 slot rendering issues ([#1763](https://github.com/inertiajs/inertia/pull/1763))
- Fix accessibility warning in Svelte `Link` component ([#1858](https://github.com/inertiajs/inertia/pull/1858))
- Use `Omit` instead of `Exclude` in router types ([#1857](https://github.com/inertiajs/inertia/pull/1857))

## [v1.0.15](https://github.com/inertiajs/inertia/compare/v1.0.14...v1.0.15)

- Bump axios from `v1.4.0` to `v1.6.0` ([#1723](https://github.com/inertiajs/inertia/pull/1723))

## [v1.0.14](https://github.com/inertiajs/inertia/compare/v1.0.13...v1.0.14)

- Revert "Clear errors on form reset (#1568)" ([#1716](https://github.com/inertiajs/inertia/pull/1716))

## [v1.0.13](https://github.com/inertiajs/inertia/compare/v1.0.12...v1.0.13)

- Clear errors on form reset ([#1568](https://github.com/inertiajs/inertia/pull/1568))
- Fix `Link` type in React ([#1659](https://github.com/inertiajs/inertia/pull/1659))

## [v1.0.12](https://github.com/inertiajs/inertia/compare/v1.0.11...v1.0.12)

- Fix type of `onClick` for `Link` component in React and Vue ([#1699](https://github.com/inertiajs/inertia/pull/1699), [#1701](https://github.com/inertiajs/inertia/pull/1701))

## [v1.0.11](https://github.com/inertiajs/inertia/compare/v1.0.10...v1.0.11)

- Fix form helper types for `setDefaults()` method (React) and `defaults()` method (Vue) ([#1504](https://github.com/inertiajs/inertia/pull/1504))
- Fix interface issue with `useForm()` in React and Vue adapters ([#1649](https://github.com/inertiajs/inertia/pull/1649))

## [v1.0.10](https://github.com/inertiajs/inertia/compare/v1.0.9...v1.0.10)

- Fix Svelte's `useForm` helper ([#1610](https://github.com/inertiajs/inertia/pull/1610))

## [v1.0.9](https://github.com/inertiajs/inertia/compare/v1.0.8...v1.0.9)

- Fix `<Head>` vNode handling in Vue 3 adapter ([#1590](https://github.com/inertiajs/inertia/pull/1590))
- Add Svelte 4 support ([60699c7](https://github.com/inertiajs/inertia/commit/60699c7c5978eebd393e0333b567d8e465f4b58f))

## [v1.0.8](https://github.com/inertiajs/inertia/compare/v1.0.7...v1.0.8)

### Fixed

- Fix `<Head>` vNode handling in Vue 3 adapter ([#1570](https://github.com/inertiajs/inertia/pull/1570))
- Fix watching remembered data in Vue 3 adapter ([#1571](https://github.com/inertiajs/inertia/pull/1571))

## [v1.0.7](https://github.com/inertiajs/inertia/compare/v1.0.6...v1.0.7)

### Fixed

- Fix `<Head>` fragment detection in Vue 3 adapter ([#1509](https://github.com/inertiajs/inertia/pull/1509))

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
