# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/inertiajs/inertia/compare/inertia@0.10.1...HEAD)

### Added

- Allow choosing query string 'array' formatters ([#994](https://github.com/inertiajs/inertia/pull/994))
- New `Progress` type ([#877](https://github.com/inertiajs/inertia/pull/877))
- New `InertiaAppResponse` type for use in [`@inertiajs/server`](https://github.com/inertiajs/server/) ([`199423`](https://github.com/inertiajs/inertia/commit/19942367b4f728e58decf581cdd93f674c7b35e5))

### Changed

- We now keep a changelog here on GitHub :tada: For earlier releases, please see [the releases page of inertiajs.com](https://inertiajs.com/releases?all=true#inertia).
- Types: Use a ProgressEvent instead of a generic object ([#877](https://github.com/inertiajs/inertia/pull/877))

### Fixed

- `<Link>` Component automatically added `http://localhost` as a prefix when it contains 'http' in it's path ([#964](https://github.com/inertiajs/inertia/pull/964))
- "rememberedState of undefined" occurred on visits where `useRemember` was used ([#949](https://github.com/inertiajs/inertia/pull/949))
