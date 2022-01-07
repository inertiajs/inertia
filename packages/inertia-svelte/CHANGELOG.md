# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/inertiajs/inertia/compare/inertia-svelte@0.8.0...HEAD)

## [v0.8.0](https://github.com/inertiajs/inertia/compare/inertia-svelte@0.7.4...inertia-svelte@0.8.0) - 2022-01-07

### Added

- Visits and `Link` components now accept a 'queryStringArrayFormat' option ([#994](https://github.com/inertiajs/inertia/pull/994))
- Add `setError` method to Form helper to manually set errors ([#999](https://github.com/inertiajs/inertia/pull/999))
- Add `defaults` method to Form helper to 'redefine' the defaults ([#1019](https://github.com/inertiajs/inertia/pull/1019))

### Changed

- We now keep a changelog here on GitHub :tada: For earlier releases, please see [the releases page of inertiajs.com](https://inertiajs.com/releases?all=true#inertia-svelte).

### Fixed

- `onSuccess` event no longer automatically resets the "default" values ([`eee2a5`](https://github.com/inertiajs/inertia/commit/eee2a5849bb107f34fe48672091e2b63ff15a8f7))
