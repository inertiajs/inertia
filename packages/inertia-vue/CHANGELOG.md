# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/inertiajs/inertia/compare/inertia-vue@0.8.0...HEAD)

### Added

- Added a Global "Visit" options hook that can be used to _override or set_ instance-provided options ([#1052](https://github.com/inertiajs/inertia/pull/1052))

### Fixed

- The `title` tag is now injected by default when one is defined ([#1055](https://github.com/inertiajs/inertia/pull/1055))

### Changed

- Types: `VisitOptions` is now exported as `VisitParams` instead due to the new Global Visit Options hook ([#1052](https://github.com/inertiajs/inertia/pull/1052))

## [v0.8.0](https://github.com/inertiajs/inertia/compare/inertia-vue@0.7.2...inertia-vue@0.8.0) - 2022-01-07

### Added

- Visits and `Link` components now accept a 'queryStringArrayFormat' option ([#994](https://github.com/inertiajs/inertia/pull/994))
- Add `setError` method to Form helper to manually set errors ([#999](https://github.com/inertiajs/inertia/pull/999))
- Add `defaults` method to Form helper to 'redefine' the defaults ([#1019](https://github.com/inertiajs/inertia/pull/1019))

### Changed

- We now keep a changelog here on GitHub :tada: For earlier releases, please see [the releases page of inertiajs.com](https://inertiajs.com/releases?all=true#inertia-vue).
- Types: Use `@inertiajs/inertia`'s new 'Progress' type ([#877](https://github.com/inertiajs/inertia/pull/877))

### Fixed

- Console warnings still referenced `<inertia-link>` instead of `<Link>` ([#916](https://github.com/inertiajs/inertia/pull/916))
- Push Inertia "plugin" to userland instead of auto-registering, similar to Vue 3 ([`425663`](https://github.com/inertiajs/inertia/commit/4256638b215e5a67d951baeab89aa6043c27e85d))
