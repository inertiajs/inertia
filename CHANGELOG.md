# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

For changes prior to v1.0.0, see the [legacy releases](https://legacy.inertiajs.com/releases).

## [Unreleased](https://github.com/inertiajs/inertia/compare/v2.3.3...master)

- Nothing yet

## [v2.3.3](https://github.com/inertiajs/inertia/compare/v2.3.2...v2.3.3) - 2025-12-17

### What's Changed

* Add support for protocol-relative urls in url.ts by [@machour](https://github.com/machour) in https://github.com/inertiajs/inertia/pull/2769
* Fix brackets notation qs parsing by [@skryukov](https://github.com/skryukov) in https://github.com/inertiajs/inertia/pull/2722
* Support for Flash Data by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2757

### New Contributors

* [@machour](https://github.com/machour) made their first contribution in https://github.com/inertiajs/inertia/pull/2769

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.3.2...v2.3.3

## [v2.3.2](https://github.com/inertiajs/inertia/compare/v2.3.1...v2.3.2) - 2025-12-16

### What's Changed

* Expose InertiaPrecognitiveForm type by [@lcdss](https://github.com/lcdss) in https://github.com/inertiajs/inertia/pull/2756
* Test for loading deferred props on `router.reload()` without `only`/`except` by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2761
* Expose `fetching` in default `<WhenVisible>` slot by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2766
* Include submitter element value in Form component submission by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2770

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.3.1...v2.3.2

## [v2.3.1](https://github.com/inertiajs/inertia/compare/v2.3.0...v2.3.1) - 2025-12-12

### What's Changed

* Test for Form + Vue Options API by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2750
* Fix for validating items in dynamic arrays by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2753
* Escape forward slashes when using useScriptElementForInitialPage by [@kirk-loretz-fsn](https://github.com/kirk-loretz-fsn) in https://github.com/inertiajs/inertia/pull/2751
* Sync Playground configs by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2754
* Fix race condition when restoring scroll regions by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2755

### New Contributors

* [@kirk-loretz-fsn](https://github.com/kirk-loretz-fsn) made their first contribution in https://github.com/inertiajs/inertia/pull/2751

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.3.0...v2.3.1

## [v2.3.0](https://github.com/inertiajs/inertia/compare/v2.2.21...v2.3.0) - 2025-12-11

### What's Changed

* Support for Precognition in `useForm()` by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2684
* Support for Precognition in `<Form>` component by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2700
* Improve Precognition examples in Playgrounds by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2746
* Improve flaky tests by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2747
* bugfix(whenVisible-vue): Fix loaded state when data already exists by [@ClaraLeigh](https://github.com/ClaraLeigh) in https://github.com/inertiajs/inertia/pull/2748

### New Contributors

* [@ClaraLeigh](https://github.com/ClaraLeigh) made their first contribution in https://github.com/inertiajs/inertia/pull/2748

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.2.21...v2.3.0

## [v2.2.21](https://github.com/inertiajs/inertia/compare/v2.2.20...v2.2.21) - 2025-12-10

### What's Changed

* Add `viewTransition` to `FormComponentOptions` type  by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2741
* Preserve untouched Once Props on Partial Reload + Once Props in Playground  by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2743
* Only preserve loaded Deferred + Once props by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2745

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.2.20...v2.2.21

## [v2.2.20](https://github.com/inertiajs/inertia/compare/v2.2.19...v2.2.20) - 2025-12-09

### What's Changed

* Bump express from 5.1.0 to 5.2.0 by [@dependabot](https://github.com/dependabot)[bot] in https://github.com/inertiajs/inertia/pull/2727
* Add tests for SSR server by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2730
* Preserve errors when loading deferred props by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2729
* Optimize page data size and parsing (37% size reduction!) by [@bram-pkg](https://github.com/bram-pkg) in https://github.com/inertiajs/inertia/pull/2687
* Support for `once()` props by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2732
* Fix for sequential Client Side Visits by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2737
* Refactor duplicated initial page code by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2738

### New Contributors

* [@bram-pkg](https://github.com/bram-pkg) made their first contribution in https://github.com/inertiajs/inertia/pull/2687

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.2.19...v2.2.20

## [v2.2.19](https://github.com/inertiajs/inertia/compare/v2.2.18...v2.2.19) - 2025-11-27

### What's Changed

* Bump dependencies by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2710
* TypeScript fix accessing error keys of optional nested object by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2718
* Use FormValue in Form component by [@skryukov](https://github.com/skryukov) in https://github.com/inertiajs/inertia/pull/2709
* Fix anchor hash scrolling on initial page visit in React by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2719
* Ensure page is rendered before scrolling to top by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2721

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.2.18...v2.2.19

## [v2.2.18](https://github.com/inertiajs/inertia/compare/v2.2.17...v2.2.18) - 2025-11-17

### What's Changed

* Ensure `objectsAreEqual()` checks all keys in both objects by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2705

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.2.17...v2.2.18

## [v2.2.17](https://github.com/inertiajs/inertia/compare/v2.2.16...v2.2.17) - 2025-11-14

### What's Changed

* Reset `<WhenVisible>` loading state after a page reload by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2699
* Add test for reloading deferred props by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2698
* Force `indices` array format when submitting data using `FormData` by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2701

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.2.16...v2.2.17

## [v2.2.16](https://github.com/inertiajs/inertia/compare/v2.2.15...v2.2.16) - 2025-11-13

### What's Changed

* Added test for `defaultValue` in Form component by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2685
* Prevent navigation on right-click on `<Link>` with `prefetch="click"` by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2676
* Export page component type for React adapter by [@skryukov](https://github.com/skryukov) in https://github.com/inertiajs/inertia/pull/2691
* Switch `useContext` to `use` in `usePage()` hook by [@HichemTab-tech](https://github.com/HichemTab-tech) in https://github.com/inertiajs/inertia/pull/2680
* Improve serialization in `formDataToObject()` when mixing numeric and non-numeric object keys by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2692
* Fix `InfiniteScroll` scroll preservation by [@skryukov](https://github.com/skryukov) in https://github.com/inertiajs/inertia/pull/2689
* Export Inertia `App` component by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2695
* Ignore `preserveScroll` and `preserveState` when finding cached response by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2694
* Upgrade Express server for test apps to v5 by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2693
* Add WebKit browser testing to CI with Safari compatibility fixes by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2696
* Bump symfony/http-foundation from 7.3.4 to 7.3.7 in /playgrounds/vue3 by [@dependabot](https://github.com/dependabot)[bot] in https://github.com/inertiajs/inertia/pull/2697
* Fix array keys misalignment in form data and query by [@skryukov](https://github.com/skryukov) in https://github.com/inertiajs/inertia/pull/2690

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.2.15...v2.2.16

## [v2.2.15](https://github.com/inertiajs/inertia/compare/v2.2.14...v2.2.15) - 2025-10-30

### What's Changed

* TS Fix for circularly references in form data  by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2673
* Improve TS for config defaults by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2674
* [v2.x] feat: allow adding type to `router.restore` by [@peaklabs-dev](https://github.com/peaklabs-dev) in https://github.com/inertiajs/inertia/pull/2545
* Configurable prefetch hover delay by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2675

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.2.14...v2.2.15

## [v2.2.14](https://github.com/inertiajs/inertia/compare/v2.2.13...v2.2.14) - 2025-10-28

### What's Changed

* TS cleanup for `<Link>` component + View Transition prop in Svelte by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2667
* Improve support for `any` as form data value by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2668

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.2.13...v2.2.14

## [v2.2.13](https://github.com/inertiajs/inertia/compare/v2.2.12...v2.2.13) - 2025-10-28

### What's Changed

* Support for View Transitions by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2658
* Opt-in to using `data-inertia` attribute in `<Head>` component by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2663
* Opt-in to using `<dialog>` for error modals by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2664
* feat: give access to underlying data as object and as form data object by [@MeiKatz](https://github.com/MeiKatz) in https://github.com/inertiajs/inertia/pull/2605

### New Contributors

* [@MeiKatz](https://github.com/MeiKatz) made their first contribution in https://github.com/inertiajs/inertia/pull/2605

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.2.12...v2.2.13

## [v2.2.12](https://github.com/inertiajs/inertia/compare/v2.2.11...v2.2.12) - 2025-10-27

### What's Changed

* Clone page props before writing it to the browser's history by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2662

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.2.11...v2.2.12

## [v2.2.11](https://github.com/inertiajs/inertia/compare/v2.2.10...v2.2.11) - 2025-10-24

### What's Changed

* Configure global defaults and update during runtime by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2655
* Stabilize prop references when visiting the same page by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2657

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.2.10...v2.2.11

## [v2.2.10](https://github.com/inertiajs/inertia/compare/v2.2.9...v2.2.10) - 2025-10-23

### What's Changed

* Restore uppercase `Component` object key in React's `App.ts` by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2654

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.2.9...v2.2.10

## [v2.2.9](https://github.com/inertiajs/inertia/compare/v2.2.8...v2.2.9) - 2025-10-21

### What's Changed

* Use local `@inertiajs/core` in Playgrounds + dependencies bump by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2633
* Introduce types for Head Manager by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2634
* Fix resolving `preserveScroll` and `preserveState` in Client Side Visits by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2635
* Support for type-hinting shared Page Props by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2636
* Add `globals.d.ts` file to Playgrounds by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2637
* Remove wrong `shouldIntercept()` call in `keydown` event handler in `<Link>` component by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2638
* Introduce `CancelToken` and `CancelTokenCallback` types to replace Axios imports by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2639
* Internal TypeScript improvements by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2640
* Tests and TS improvements for the `<Head>` component by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2641
* Make `data` prop of `<InfiniteScroll>` required by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2642
* TS fixes in Vue adapter for `useRemember` and `remember` mixin by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2643
* Bump vite from 5.4.20 to 5.4.21 by [@dependabot](https://github.com/dependabot)[bot] in https://github.com/inertiajs/inertia/pull/2647
* TypeScript improvements to `createInertiaApp()` and unifying it across adapters by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2648
* ESLint check for test-apps by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2560

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.2.8...v2.2.9

## [v2.2.8](https://github.com/inertiajs/inertia/compare/v2.2.7...v2.2.8) - 2025-10-09

### What's Changed

* Prevent false positives in `getScrollableParent()` by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2626
* Restore scroll regions after navigation by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2627
* Prevent replacing history state when scroll regions are unchanged to fix popstate behavior in WebKit by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2629

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.2.7...v2.2.8

## [v2.2.7](https://github.com/inertiajs/inertia/compare/v2.2.6...v2.2.7) - 2025-10-07

### What's Changed

* Preserve relative URL when `<InfiniteScroll>` updates query string by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2623
* Use `SlotsType` to type-hint Vue slots by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2620
* Fix race condition in `history.ts` by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2624

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.2.6...v2.2.7

## [v2.2.6](https://github.com/inertiajs/inertia/compare/v2.2.5...v2.2.6) - 2025-10-03

### What's Changed

* SSR fixes for `<InfiniteScroll>` component. by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2616

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.2.5...v2.2.6

## [v2.2.5](https://github.com/inertiajs/inertia/compare/v2.2.4...v2.2.5) - 2025-10-02

### What's Changed

* Improve `<InfiniteScroll>` cleanup after navigating away by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2610
* Fix for `<Form>` component when using React SSR by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2612
* Fix conflicting Client Side Visits by queuing the URL synchronization by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2613
* Improvements to `<InfiniteScroll>` in Svelte adapter by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2614

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.2.4...v2.2.5

## [v2.2.4](https://github.com/inertiajs/inertia/compare/v2.2.3...v2.2.4) - 2025-09-30

### What's Changed

* Compile TS while developing + improve CLI output by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2600
* Improve testing of scroll restoration by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2602
* Fix for reloading an unrelated prop affecting infinite scroll by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2603
* Add `preserve-url` prop to `<Link>` component by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2541

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.2.3...v2.2.4

## [v2.2.3](https://github.com/inertiajs/inertia/compare/v2.2.2...v2.2.3) - 2025-09-29

### What's Changed

* Preserve `ScrollProp` on Partial Reloads by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2597

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.2.2...v2.2.3

## [v2.2.2](https://github.com/inertiajs/inertia/compare/v2.2.1...v2.2.2) - 2025-09-28

### What's Changed

* Reset `ScrollProp` when requested by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2595

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.2.1...v2.2.2

## [v2.2.1](https://github.com/inertiajs/inertia/compare/v2.2.0...v2.2.1) - 2025-09-28

### What's Changed

* Don't restore remembered state after a refresh by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2591
* Remember Infinite Scroll state by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2592

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.2.0...v2.2.1

## [v2.2.0](https://github.com/inertiajs/inertia/compare/v2.1.11...v2.2.0) - 2025-09-26

### What's Changed

* Support for merging nested prop paths by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2561
* Client-side visit helpers to update props by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2589
* Introduction of the `<InfiniteScroll>` component by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2580

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.1.11...v2.2.0

## [v2.1.11](https://github.com/inertiajs/inertia/compare/v2.1.10...v2.1.11) - 2025-09-24

### What's Changed

* Fix flaky tests in CI by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2582
* Bump Playwright by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2585
* Progress indicator API by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2581

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.1.10...v2.1.11

## [v2.1.10](https://github.com/inertiajs/inertia/compare/v2.1.9...v2.1.10) - 2025-09-22

### What's Changed

* Fix PNPM publishing by [@joetannenbaum](https://github.com/joetannenbaum) in https://github.com/inertiajs/inertia/pull/2578

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.1.9...v2.1.10

## [v2.1.9](https://github.com/inertiajs/inertia/compare/v2.1.8...v2.1.9) - 2025-09-22

### What's Changed

* Fix PNPM build by [@joetannenbaum](https://github.com/joetannenbaum) in https://github.com/inertiajs/inertia/pull/2577

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.1.8...v2.1.9

## [v2.1.8](https://github.com/inertiajs/inertia/compare/v2.1.7...v2.1.8) - 2025-09-22

### What's Changed

* Publish packages in CI by [@joetannenbaum](https://github.com/joetannenbaum) in https://github.com/inertiajs/inertia/pull/2575

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.1.7...v2.1.8

## [v2.1.7](https://github.com/inertiajs/inertia/compare/v2.1.6...v2.1.7) - 2025-09-18

### What's Changed

* Bump axios from 1.11.0 to 1.12.0 by [@dependabot](https://github.com/dependabot)[bot] in https://github.com/inertiajs/inertia/pull/2568
* Bump dependencies by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2571
* TypeScript upgrade by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2573

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.1.6...v2.1.7

## [v2.1.6](https://github.com/inertiajs/inertia/compare/v2.1.5...v2.1.6) - 2025-09-12

### What's Changed

* Invalidate prefetch cache when page is received from a network request by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2567

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.1.5...v2.1.6

## [v2.1.5](https://github.com/inertiajs/inertia/compare/v2.1.4...v2.1.5) - 2025-09-05

### What's Changed

* Fix race condition when combining Deferred Props with an instant Partial Reload on mount by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2562

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.1.4...v2.1.5

## [v2.1.4](https://github.com/inertiajs/inertia/compare/v2.1.3...v2.1.4) - 2025-09-03

### What's Changed

* Replace html-escape with built-in function on Svelte package by [@kresnasatya](https://github.com/kresnasatya) in https://github.com/inertiajs/inertia/pull/2535
* Update dirty state after DOM changes (React only) by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2558
* Prevent errors caused by null href value by [@fritz-c](https://github.com/fritz-c) in https://github.com/inertiajs/inertia/pull/2550
* Remove data from the dependency array of setDefaults by [@jasonlbeggs](https://github.com/jasonlbeggs) in https://github.com/inertiajs/inertia/pull/2554

### New Contributors

* [@fritz-c](https://github.com/fritz-c) made their first contribution in https://github.com/inertiajs/inertia/pull/2550
* [@jasonlbeggs](https://github.com/jasonlbeggs) made their first contribution in https://github.com/inertiajs/inertia/pull/2554

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.1.3...v2.1.4

## [v2.1.3](https://github.com/inertiajs/inertia/compare/v2.1.2...v2.1.3) - 2025-08-27

### What's Changed

* Code formatting with Prettier by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2515
* Add EditorConfig and fix some whitespace issues by [@jrmajor](https://github.com/jrmajor) in https://github.com/inertiajs/inertia/pull/2516
* Fix for nullable object types in `useForm` by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2528
* Fix for Form Component in Svelte when resetting use input/button by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2525
* Improve Link component `as` prop by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2524
* [v2.x] fix: type error by changing page props type to `any` by [@peaklabs-dev](https://github.com/peaklabs-dev) in https://github.com/inertiajs/inertia/pull/2520
* Revert to back to Lodash to retain ES2020 compatibility by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2527
* Verify ES2020 compatibility in CI by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2530
* [Vue] Fixing action attribute on Form Component when using Wayfinder by [@nicolagianelli](https://github.com/nicolagianelli) in https://github.com/inertiajs/inertia/pull/2532
* Make package.json structure in Svelte package Consistent as Vue and React by [@kresnasatya](https://github.com/kresnasatya) in https://github.com/inertiajs/inertia/pull/2529
* Remove Svelte 5-next version constraint by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2533
* improve typescript configuration by [@sudo-barun](https://github.com/sudo-barun) in https://github.com/inertiajs/inertia/pull/2470
* Format JSON files with Prettier by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2534
* Fix warning about `inert` attribute in React < 19 by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2536
* Fix keyboard activation when using `prefetch: 'click'` by [@pedroborges](https://github.com/pedroborges) in https://github.com/inertiajs/inertia/pull/2538
* Fix `useForm` to respect manual `setDefaults()` calls in `onSuccess` and unify timing across adapters by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2539
* Run Playwright in parallel in CI by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2540
* Fix Coding Standards workflow by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2547
* bumpup axios to fix CVE-2025-7783 by [@vallerydelexy](https://github.com/vallerydelexy) in https://github.com/inertiajs/inertia/pull/2546
* Bump `@sveltejs/kit` version by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2548

### New Contributors

* [@peaklabs-dev](https://github.com/peaklabs-dev) made their first contribution in https://github.com/inertiajs/inertia/pull/2520
* [@nicolagianelli](https://github.com/nicolagianelli) made their first contribution in https://github.com/inertiajs/inertia/pull/2532
* [@kresnasatya](https://github.com/kresnasatya) made their first contribution in https://github.com/inertiajs/inertia/pull/2529
* [@vallerydelexy](https://github.com/vallerydelexy) made their first contribution in https://github.com/inertiajs/inertia/pull/2546

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.1.2...v2.1.3

## [v2.1.2](https://github.com/inertiajs/inertia/compare/v2.1.1...v2.1.2) - 2025-08-15

### What's Changed

* Fix for manipulating form after redirect in `onSubmitComplete` by [@joetannenbaum](https://github.com/joetannenbaum) in https://github.com/inertiajs/inertia/pull/2510
* Support for passing Wayfinder objects to router methods by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2497
* Tag-based cache invalidation for prefetch requests by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2484
* Add `resetOnError`, `resetOnSuccess`, `setDefaultsOnSuccess` to Form component by [@joetannenbaum](https://github.com/joetannenbaum) in https://github.com/inertiajs/inertia/pull/2514

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.1.1...v2.1.2

## [v2.1.1](https://github.com/inertiajs/inertia/compare/v2.1.0...v2.1.1) - 2025-08-14

### What's Changed

* Improve `Link` component types and support for prefetch events by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2464
* allow passing partial errors object to `setError()` by [@sudo-barun](https://github.com/sudo-barun) in https://github.com/inertiajs/inertia/pull/2461
* Add missing generic type support to PendingVisit and VisitHelperOptions by [@HichemTab-tech](https://github.com/HichemTab-tech) in https://github.com/inertiajs/inertia/pull/2454
* Revamp useForm's generic types across adaptors by [@Spice-King](https://github.com/Spice-King) in https://github.com/inertiajs/inertia/pull/2335
* TypeScript improvements for `Link` component and Client Side Visits by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2472
* Further TS improvements for `useForm` by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2475
* Improve consistency in `useForm` across adapters by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2482
* Improve TypeScript support for Client Side Visit `props` callback by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2483
* TS improvements to Svelte's `<Form>` and `useForm()` implementations by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2489
* Typescript Improvements by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2468
* Test apps in TypeScript by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2469
* Fix empty action in `<Form>` component when the current URL has more than one segment by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2501
* Support uppercase method in `<Form>` component by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2502
* Add `Form` component `disableWhileProcessing` prop by [@joetannenbaum](https://github.com/joetannenbaum) in https://github.com/inertiajs/inertia/pull/2504
* Reset form fields by name in Form components by [@skryukov](https://github.com/skryukov) in https://github.com/inertiajs/inertia/pull/2499
* Add `onSubmitComplete` prop to `Form` component by [@joetannenbaum](https://github.com/joetannenbaum) in https://github.com/inertiajs/inertia/pull/2503
* Remove failed prefetch requests from in-flight array by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2500
* Add `defaults()` method to Form component by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2507
* Release script by [@joetannenbaum](https://github.com/joetannenbaum) in https://github.com/inertiajs/inertia/pull/2508
* Only `reset()` and `defaults()` in `onSubmitComplete` by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2509

### New Contributors

* [@sudo-barun](https://github.com/sudo-barun) made their first contribution in https://github.com/inertiajs/inertia/pull/2461

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.1.0...v2.1.1

## [v2.1.0](https://github.com/inertiajs/inertia/compare/v2.0.17...v2.1.0) - 2025-08-13

### What's Changed

* Support for passing custom component to `as` prop of `Link` component. by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2443
* Use `nodemon` to trigger new files and deleted files in test apps by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2442
* Use ReactNode type for children props by [@chack1172](https://github.com/chack1172) in https://github.com/inertiajs/inertia/pull/2385
* Allow function as children component in react Deferred and WhenVisible by [@chack1172](https://github.com/chack1172) in https://github.com/inertiajs/inertia/pull/2386
* Improve test that waits for scroll position restoration by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2473
* Introduction of the `Form` component by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2474
* Improve `children` prop of `<Form>` Component by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2487
* Add Form component ref support by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2496
* Make Svelte's <Deferred> not crash in an SSR environment by [@dkulchenko](https://github.com/dkulchenko) in https://github.com/inertiajs/inertia/pull/2396
* Fix core: Queue processing when an item fails by [@pintend](https://github.com/pintend) in https://github.com/inertiajs/inertia/pull/2467
* Migrate playgrounds to Tailwind 4 by [@jrmajor](https://github.com/jrmajor) in https://github.com/inertiajs/inertia/pull/2369

### New Contributors

* [@dkulchenko](https://github.com/dkulchenko) made their first contribution in https://github.com/inertiajs/inertia/pull/2396
* [@pintend](https://github.com/pintend) made their first contribution in https://github.com/inertiajs/inertia/pull/2467

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.0.17...v2.1.0

## [v2.0.17](https://github.com/inertiajs/inertia/compare/v2.0.16...v2.0.17) - 2025-07-18

### What's Changed

* Bump multer from 2.0.1 to 2.0.2 by [@dependabot](https://github.com/dependabot)[bot] in https://github.com/inertiajs/inertia/pull/2447
* Bump vite from 5.4.12 to 5.4.19 by [@dependabot](https://github.com/dependabot)[bot] in https://github.com/inertiajs/inertia/pull/2450
* Bump esbuild from 0.21.5 to 0.25.0 by [@dependabot](https://github.com/dependabot)[bot] in https://github.com/inertiajs/inertia/pull/2451
* Explicit string coercion in `Head` component by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2453

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.0.16...v2.0.17

## [v2.0.16](https://github.com/inertiajs/inertia/compare/v2.0.15...v2.0.16) - 2025-07-18

### What's Changed

* Make errorBag parameter optional by [@joelstein](https://github.com/joelstein) in https://github.com/inertiajs/inertia/pull/2445

### New Contributors

* [@joelstein](https://github.com/joelstein) made their first contribution in https://github.com/inertiajs/inertia/pull/2445

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.0.15...v2.0.16

## [v2.0.15](https://github.com/inertiajs/inertia/compare/v2.0.14...v2.0.15) - 2025-07-17

### What's Changed

* Improve GitHub issue templates by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2418
* Escape the attribute values that are passed into the `Head` component by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2403
* Introduce single method to reset form state and clear errors by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2414
* Use `CacheForOption` type in React `Link` component by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2426
* Improve query string merging in `mergeDataIntoQueryString()`  by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2417
* Improve scrolling when using anchor hash by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2428
* Cancel sync request on popstate event by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2429
* Support for path traversal by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2413
* Add event callbacks to `ClientSideVisitOptions` by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2405
* Pass parameters to `onFinish` and `onSuccess` callbacks on Client Side Visits by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2433
* Prevent JS builds and test apps from being minified by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2424
* Migrate to pnpm by [@jrmajor](https://github.com/jrmajor) in https://github.com/inertiajs/inertia/pull/2276
* Fix single-use prefetching by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2440
* Change defaults values order in onSuccess callback of useForm by [@yilanboy](https://github.com/yilanboy) in https://github.com/inertiajs/inertia/pull/2437
* Improve reactivity of Link components by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2441

### New Contributors

* [@yilanboy](https://github.com/yilanboy) made their first contribution in https://github.com/inertiajs/inertia/pull/2437

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.0.14...v2.0.15

## [v2.0.14](https://github.com/inertiajs/inertia/compare/v2.0.13...v2.0.14) - 2025-06-26

### What's Changed

* fix: fixed type error in `useForm SetDataAction` type by [@fxnm](https://github.com/fxnm) in https://github.com/inertiajs/inertia/pull/2395
* Call `provider.update` outside useEffect block to support SSR by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2397
* Improve state restore logic in `useRemember` by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2401

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.0.13...v2.0.14

## [v2.0.13](https://github.com/inertiajs/inertia/compare/v2.0.12...v2.0.13) - 2025-06-20

### What's Changed

* Allow deepMerge on custom properties by [@mpociot](https://github.com/mpociot) in https://github.com/inertiajs/inertia/pull/2344
* fix: React StrictMode breaking Inertia Head by [@jordanhavard](https://github.com/jordanhavard) in https://github.com/inertiajs/inertia/pull/2328
* Bump multer from 1.4.4 to 2.0.1 in /tests/app by [@dependabot](https://github.com/dependabot) in https://github.com/inertiajs/inertia/pull/2373
* Initialize router before components in React by [@chack1172](https://github.com/chack1172) in https://github.com/inertiajs/inertia/pull/2379
* Prevent duplicate render of the initial page in React by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2377
* Update default state when `setDefault()` is called right after `setData()` is called by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2364
* [2.x] Restore `router.resolveComponent()` method by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2039
* Move `currentIsInitialPage` variable outside of `App` by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2381
* Don't overwrite Vite class in Svelte playgrounds by [@jrmajor](https://github.com/jrmajor) in https://github.com/inertiajs/inertia/pull/2368
* Dependency update + Prevent Playwright 1.53.0 due to Svelte bug by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2382
* Update to Vite 6 by [@SuperDJ](https://github.com/SuperDJ) in https://github.com/inertiajs/inertia/pull/2315
* Fix React scroll restoration on popState by [@sebastiandedeyne](https://github.com/sebastiandedeyne) in https://github.com/inertiajs/inertia/pull/2357
* feat(useForm): export granular setData types and introduce SetDataAction<TForm> by [@hasib-devs](https://github.com/hasib-devs) in https://github.com/inertiajs/inertia/pull/2356
* Refactor `mergeStrategies` to `matchOn` by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2384
* Remove `setSwapComponent` method and cleanup after PR #2379 by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2383

### New Contributors

* [@jordanhavard](https://github.com/jordanhavard) made their first contribution in https://github.com/inertiajs/inertia/pull/2328
* [@chack1172](https://github.com/chack1172) made their first contribution in https://github.com/inertiajs/inertia/pull/2379
* [@jrmajor](https://github.com/jrmajor) made their first contribution in https://github.com/inertiajs/inertia/pull/2368
* [@SuperDJ](https://github.com/SuperDJ) made their first contribution in https://github.com/inertiajs/inertia/pull/2315
* [@hasib-devs](https://github.com/hasib-devs) made their first contribution in https://github.com/inertiajs/inertia/pull/2356

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.0.12...v2.0.13

## [v2.0.12](https://github.com/inertiajs/inertia/compare/v2.0.11...v2.0.12) - 2025-06-10

### What's Changed

* Send `Purpose: prefetch` header on prefetching by [@pascalbaljet](https://github.com/pascalbaljet) in https://github.com/inertiajs/inertia/pull/2367

### New Contributors

* [@pascalbaljet](https://github.com/pascalbaljet) made their first contribution in https://github.com/inertiajs/inertia/pull/2367

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.0.11...v2.0.12

## [v2.0.11](https://github.com/inertiajs/inertia/compare/v2.0.10...v2.0.11) - 2025-05-16

### What's Changed

* Fix progress bar not showing on subsequent page clicks by [@joetannenbaum](https://github.com/joetannenbaum) in https://github.com/inertiajs/inertia/pull/2349

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.0.10...v2.0.11

## [v2.0.10](https://github.com/inertiajs/inertia/compare/v2.0.9...v2.0.10) - 2025-05-15

### What's Changed

* Don't show progress bar on prefetch hover by [@joetannenbaum](https://github.com/joetannenbaum) in https://github.com/inertiajs/inertia/pull/2347

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.0.9...v2.0.10

## [v2.0.9](https://github.com/inertiajs/inertia/compare/v2.0.8...v2.0.9) - 2025-05-09

### What's Changed

* Bump [@sveltejs](https://github.com/sveltejs)/kit from 2.11.1 to 2.20.6 by [@dependabot](https://github.com/dependabot) in https://github.com/inertiajs/inertia/pull/2312
* Bump vite from 5.4.17 to 5.4.18 by [@dependabot](https://github.com/dependabot) in https://github.com/inertiajs/inertia/pull/2307
* Fix for deferred props + prefetch links by [@joetannenbaum](https://github.com/joetannenbaum) in https://github.com/inertiajs/inertia/pull/2321
* Progress: Make hide and reveal CSP-compatible by [@flexponsive](https://github.com/flexponsive) in https://github.com/inertiajs/inertia/pull/2316
* Corrected URL search parameter merge logic to match behavior prior to v2.0.8 by [@joetannenbaum](https://github.com/joetannenbaum) in https://github.com/inertiajs/inertia/pull/2341
* Corrects url search parameter merge logic to match behavior prior to v2.0.8 by [@CTOJoe](https://github.com/CTOJoe) in https://github.com/inertiajs/inertia/pull/2320
* Bump vite from 5.4.18 to 5.4.19 by [@dependabot](https://github.com/dependabot) in https://github.com/inertiajs/inertia/pull/2334
* On back button, fetch from server if version hash is not current by [@joetannenbaum](https://github.com/joetannenbaum) in https://github.com/inertiajs/inertia/pull/2342
* Allow custom URL protocols by [@mpociot](https://github.com/mpociot) in https://github.com/inertiajs/inertia/pull/2329

### New Contributors

* [@flexponsive](https://github.com/flexponsive) made their first contribution in https://github.com/inertiajs/inertia/pull/2316
* [@CTOJoe](https://github.com/CTOJoe) made their first contribution in https://github.com/inertiajs/inertia/pull/2320

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.0.8...v2.0.9

## [v2.0.8](https://github.com/inertiajs/inertia/compare/v2.0.7...v2.0.8) - 2025-04-10

### What's Changed

* Add deepMerge Support for Merging Nested Arrays and Objects in Props by [@HichemTab-tech](https://github.com/HichemTab-tech) in https://github.com/inertiajs/inertia/pull/2069
* fix: build error because of invalid type definitions by [@fxnm](https://github.com/fxnm) in https://github.com/inertiajs/inertia/pull/2301
* fix(vue/useForm/defaults): untrack before assign by [@Dsaquel](https://github.com/Dsaquel) in https://github.com/inertiajs/inertia/pull/2112
* Improve type checking of request data by [@7nohe](https://github.com/7nohe) in https://github.com/inertiajs/inertia/pull/2304
* Remove empty payload from GET requests by [@edgars-vasiljevs](https://github.com/edgars-vasiljevs) in https://github.com/inertiajs/inertia/pull/2305

### New Contributors

* [@HichemTab-tech](https://github.com/HichemTab-tech) made their first contribution in https://github.com/inertiajs/inertia/pull/2069
* [@fxnm](https://github.com/fxnm) made their first contribution in https://github.com/inertiajs/inertia/pull/2301
* [@Dsaquel](https://github.com/Dsaquel) made their first contribution in https://github.com/inertiajs/inertia/pull/2112

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.0.7...v2.0.8

## [v2.0.7](https://github.com/inertiajs/inertia/compare/v2.0.6...v2.0.7) - 2025-04-08

### What's Changed

* Added missing pages to React and Svelte5 playrounds by [@Verox001](https://github.com/Verox001) in https://github.com/inertiajs/inertia/pull/2217
* chore: replace lodash to decrease bundle size by [@lcdss](https://github.com/lcdss) in https://github.com/inertiajs/inertia/pull/2210
* do not pass url when storing scroll state to history by [@miDeb](https://github.com/miDeb) in https://github.com/inertiajs/inertia/pull/2280
* fix: react `Deferred` component error on partial visits by [@KaioFelps](https://github.com/KaioFelps) in https://github.com/inertiajs/inertia/pull/2223
* Bump vite from 5.4.16 to 5.4.17 by [@dependabot](https://github.com/dependabot) in https://github.com/inertiajs/inertia/pull/2295
* [2.x] SSR clustering by [@RobertBoes](https://github.com/RobertBoes) in https://github.com/inertiajs/inertia/pull/2206
* Allow Object type for href prop by [@nckrtl](https://github.com/nckrtl) in https://github.com/inertiajs/inertia/pull/2292
* Update GitHub Actions to Ubuntu 24.04 by [@joetannenbaum](https://github.com/joetannenbaum) in https://github.com/inertiajs/inertia/pull/2299
* [2.x]: Support for nested paths in forms by [@joaopalopes24](https://github.com/joaopalopes24) in https://github.com/inertiajs/inertia/pull/2181

### New Contributors

* [@Verox001](https://github.com/Verox001) made their first contribution in https://github.com/inertiajs/inertia/pull/2217
* [@lcdss](https://github.com/lcdss) made their first contribution in https://github.com/inertiajs/inertia/pull/2210
* [@miDeb](https://github.com/miDeb) made their first contribution in https://github.com/inertiajs/inertia/pull/2280
* [@KaioFelps](https://github.com/KaioFelps) made their first contribution in https://github.com/inertiajs/inertia/pull/2223
* [@nckrtl](https://github.com/nckrtl) made their first contribution in https://github.com/inertiajs/inertia/pull/2292
* [@joaopalopes24](https://github.com/joaopalopes24) made their first contribution in https://github.com/inertiajs/inertia/pull/2181

**Full Changelog**: https://github.com/inertiajs/inertia/compare/v2.0.6...v2.0.7

## [v2.0.6](https://github.com/inertiajs/inertia/compare/v2.0.5...v2.0.6)

- Deferred: More descriptive Deferred data prop error ([#2284](https://github.com/inertiajs/inertia/pull/2284))
- Bump vite from 5.4.12 to 5.4.16 ([#2288](https://github.com/inertiajs/inertia/pull/2288))
- Fix location return history decryption throwing error ([#2282](https://github.com/inertiajs/inertia/pull/2282))
- Make isDirty reactive to defaults ([#2236](https://github.com/inertiajs/inertia/pull/2236))
- Fix playground WhenVisible always ([#2203](https://github.com/inertiajs/inertia/pull/2203))
- Wayfinder support ([#2290](https://github.com/inertiajs/inertia/pull/2290))

## [v2.0.5](https://github.com/inertiajs/inertia/compare/v2.0.4...v2.0.5)

- Fix history state errors by nicholaspufal ([#2265](https://github.com/inertiajs/inertia/pull/2265))
- Bump axios from 1.7.9 to 1.8.2 ([#2269](https://github.com/inertiajs/inertia/pull/2269))
- Bump esbuild from 0.16.17 to 0.25.0 #2231 ([#2231](https://github.com/inertiajs/inertia/pull/2231))
- Bump vite from 5.4.11 to 5.4.12 ([#2201](https://github.com/inertiajs/inertia/pull/2201))

## [v2.0.4](https://github.com/inertiajs/inertia/compare/v2.0.3...v2.0.4)

- Fix anchor links on initial visits ([#2258](https://github.com/inertiajs/inertia/pull/2258))

## [v2.0.3](https://github.com/inertiajs/inertia/compare/v2.0.2...v2.0.3)

- Fix: Reload on mount ([#2200](https://github.com/inertiajs/inertia/pull/2200))

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
