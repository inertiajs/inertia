# Inertia X Æ A-Xii

Inertia X Æ A-Xii is an adaptation and (almost) drop-in replacement for the [Inertiajs](https://inertiajs.com) client side adapter for Svelte 5.

Forked from Inertia 2.0, it contains the following changes:

* A new `<Frame>` component with support for multiple routers in the same app.
* The global page store has been removed. All state is now encapsulated within Frame components, and leverage Svelte 5's fine-grained reactivity.
* The `<App>` component has replaced by a top-level `<Frame>` component.
* The structre of the history state has been altered: The `Page` object does not contain props anymore. Instead, it now contains several `Frame` objects that contain the props for each frame.

## Breaking Changes

### Context instead of imports

Many functions and objects are now "frames-aware". This means that they are not globally exported anymore, but have to be fetched from the Svelte context:

```diff
-import { router, page, inertia, useForm } from 'inertiax-svelte'
+const { router, page, inertia, useForm } = getContext('frame')
```

To get the router or page of a parent frame, use `getContext('router:[frameName]))`

### Global click handler

By default, Inertia X Æ A-Xii uses a global click handler to intercept all `<a>` tags for the Inertia router. If you don't want this, add a `data-inertia-ignore` attribute to the `<a>` tag or one of its parents. To opt-out globally, set the `data-inertia-ignore` attribute on the `<body>`.

## New Features

### `<Frame>`

The Frame component is the heart and soul of Inertia X Æ A-Xii. It allows you to embed an Inertia page within another Inertia page. This way you can easily create interactive modals, wizrards, dialogs, sidebars, etc.

All navigation (including form submissions) is encapsulated within the Frame component.

#### Things to note

* Props on the `<Frame>` component are being passed on to the Inertia page component.
* When making a request from within a Frame, the `X-Inertia-Referer` header contains the URL of the frame. Use this instead of calling `redirect_back`, if you want to redirect the user back.
