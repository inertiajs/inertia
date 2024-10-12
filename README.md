# Inertia X Æ A-Xii

Inertia X Æ A-Xii is an adaptation and (almost) drop-in replacement for the [Inertiajs](https://inertiajs.com) client side adapter for Svelte 5.

Forked from Inertia 2.0, it contains the following changes:

* All state is now saved within `<Frame>` components, leveraging Svelte 5's fine-grained reactivity. The global page store has been removed. 
* A top-level `<Frame>` component is taking the place of the `<App>` component. The `<App>` component has been removed.
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

The `<Link>` component and the `use:inertia` action have been removed. Instead, we use a global click handler to intercept clicks and pass them to the Inertia router. You can opt out of this by adding a `data-inertia-ignore` attribute to the link. To opt-out globally, set the `data-inertia-ignore` attribute on the `<body>`.

## New Features

### `<Frame>`

The Frame component is the heart and soul of this version of Inertia. It allows you to embed an Inertia page within another Inertia page. This way you can easily create interactive modals, wizrards, dialogs, sidebars, etc.

All navigation (including form submissions) is encapsulated within the Frame component.

### Usage

```html
<Frame src="/dashboard">
  Loading...
</Frame>
```

### Props

| Prop | Type | Description |
| --- | --- | --- |
| `src` | string | The URL of the page to load |
| `name` | string | The name of the frame. This is used to identify the frame in the history state |
| `component` | string | The name of the Inertia page component to load. `src` is ignored if this is set. |
| `renderLayout` | boolean | Whether to render the layout. Defaults to `true` if `name` == `_top`. `false` otherwise. |

#### Things to note

* Props on the `<Frame>` component are being passed on to the Inertia page component.
* When making a request from within a Frame, the `X-Inertia-Referer` header contains the URL of the frame. Use this instead of calling `redirect_back`, if you want to redirect the user back.
