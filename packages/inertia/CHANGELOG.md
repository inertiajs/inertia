# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/inertiajs/inertia/compare/inertia@0.11.0...HEAD)

### Added

- Added a Global "Visit" options hook that can be used to _override or set_ instance-provided options ([#1052](https://github.com/inertiajs/inertia/pull/1052))

### Fixed

- The `title` tag is now injected by default when one is defined ([#1055](https://github.com/inertiajs/inertia/pull/1055))

### Changed

- Update axios version to `0.26.0` ([#1116](https://github.com/inertiajs/inertia/pull/1116))
- Types: `VisitOptions` is now exported as `VisitParams` instead due to the new Global Visit Options hook ([#1052](https://github.com/inertiajs/inertia/pull/1052))

## [v0.11.0](https://github.com/inertiajs/inertia/compare/inertia@0.10.1...inertia@0.11.0) - 2022-01-07

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
- Forms with remember keys were giving `ReferenceError: window is not defined` during SSR ([#1036](https://github.com/inertiajs/inertia/pull/1036))
- Certain events always required 'bool' return types, while 'void' (falsy) should be possible too ([#1037](https://github.com/inertiajs/inertia/pull/1037))
