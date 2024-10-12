# Inertia X Æ A-Xii

Inertia X Æ A-Xii is an adaptation and (almost) drop-in replacement for the [Inertiajs](https://inertiajs.com) client side adapter for Svelte 5.

Forked from Inertia 2.0, it contains the following changes:

* It adds support for the `<Frame>` component with multiple routers in the same app
* It drops the global page store. Instead, each `<Frame>` has its own store.
* It removes the `<App>` component and replaces it with a top-level `<Frame>`.
* It changes the structure of the history state: The `Page` object does not contain props anymore. Instead, it now contains several `Frame` objects that contain the props for each frame.

Unfortunately, this is only for Svelte 5 at the moment. However, the changes to the internal API are minimal. It shouldn't be too hard to add support for your favourite framework.

## Breaking Changes

### Context instead of imports

Many functions and objects are now "frames-aware". This means that they are now not globally exported anymore, but have to be fetched from the Svelte context:

```diff
-import { router, page, inertia, useForm } from '@inertiajs/svelte'
+const { router, page, inertia, useForm } = getContext('frame')
```

To get the router or page of a parent frame, use `getContext('router:[frameName]))`

### Global click handler

By default, Inertia X Æ A-Xii uses a global click handler to intercept all `<a>` tags for the Inertia router. If you don't want this, add a `data-inertia-ignore` attribute to the `<a>` tag or one of its parents. To opt-out globally, set the `data-inertia-ignore` attribute on the `<body>`.

## New Features