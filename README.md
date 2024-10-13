# Inertia X Æ A-Xii

Inertia X Æ A-Xii is an adaptation and (almost) drop-in replacement for the [Inertiajs](https://inertiajs.com) client side adapter for Svelte 5.

This is complete rewrite of Inertia X based on the Inertia 2.0 beta. Inertia X started as a proof-of-concept for the Frame component, but now I'm developing it as a real project (because I'm also dogfeeding it at my job).

It contains the following changes:

* All state is now saved within `<Frame>` components, leveraging Svelte 5's fine-grained reactivity. The global page store has been removed. 
* A top-level `<Frame>` component is taking the place of the `<App>` component. The `<App>` component has been removed.
* The structre of the history state has been altered: The `Page` object does not contain props anymore. Instead, it now contains several `Frame` objects that contain the props for each frame.
* A global click handler

## Breaking Changes

### Vite required

Vite is now **required** to build the adapter. This is because we're now using `import.meta.env.SSR` instead of `typeof window === 'undefined'`. This allows Vite to statically analyze and optimize the code at transpile time, and won't result in SSR-related code to be shipped to the browser.

### Context instead of imports

There now exists a router and a page store at the Frame level. That means, that they are not globally exported anymore. Instead, they are saved in the Svelte context of each Frame:

```diff
-import { router, page } from '@inertiajs/svelte'
+const { router, page } = getContext('inertia')
```

To get the context of a parent Frame, use `getContext('inertia:[frame name]))`. For example, to get the top-level router (which exists within the Frame with the name `_top`), use `const { router } = getContext('inertia:_top')`.

### Global click handler

The `<Link>` component and the `use:inertia` action have been removed. Instead, we use a global click handler to intercept clicks and pass them to the Inertia router. You can opt out of this by adding a `data-inertia-ignore` attribute to the link. To opt-out globally, set the `data-inertia-ignore` attribute on the `<body>`.

## New Features

### `<Frame>`

The Frame component is the heart and soul of this version of Inertia. It allows you to embed an Inertia page within another Inertia page. This way you can easily create interactive modals, wizards, dialogs, sidebars, etc.

#### Usage

```html
<Frame url="/dashboard">
  Loading...
</Frame>
```

#### Things to note

* All navigation (including form submissions) is encapsulated within the Frame component. To "break out" of a Frame, make the request on a different router. Frame components export their router via `frame.router`.
* When making a request from within a Frame, the `X-Inertia-Referer` header contains the URL of the frame. Use this instead of calling `redirect_back`, if you want to redirect the user back.

#### Props

| Prop | Type | Description |
| --- | --- | --- |
| `url` | string | (required if `component` is not given) The URL of the page to load |
| `component` | string | (required if `url` is not given) The name of the Inertia page component to load. |
| `props` | object | (optional) The initial props to pass to the Inertia page component. They will be replaced once `url` has been loaded. |
| `renderLayout` | boolean | (optional) Whether to render the layout. Defaults to `true` if `name` == `_top`. `false` otherwise. |
| `name` | string | (optional) The name of the frame. This is used to identify the frame in the history state |

## Installation

```bash
npm install -D inertiax-svelte inertiax-core
```

```diff
-import { createInertiaApp } from '@inertiajs/svelte'
+import { createInertiaApp } from 'inertiax-svelte'
```