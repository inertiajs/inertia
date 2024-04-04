# Inertia with Frames

This is a modified version of [Inertia](https://github.com/inertiajs/inertia) that adds support for Frames. The current implementation is experimental (and very hacky) and currently only supported in Svelte and React.

## Frames

This fork introduces the `<Frame>` component. This component is used to encapsulate an Inertia page within another Inertia page. This is useful for creating modal dialogs, wizards, search sidebars, popovers, etc.

By default, hyperlinks and form submissions will render the response within the frame that contains the link or the form. To change the frame in which an Inertia response is rendered, do one of the following:

- Add a `data-target="frame-id"` attribute to an `a` tag.
- Pass a  `{target: frameId}` to `router.visit()` or `form.submit()`
- Specify the frame ID in an `X-Inertia-Frame` header from the server.

To target the top (main) frame, use `_top` as the frame ID.

Navigation within frames does not create new history entries. To enable this, a more substantial rewrite of the Inertia router would be required.

Frames are loaded when the component is mounted. That means, that only the initial frame placeholder content will be rendered during SSR.

### Try locally

Clone this repo, [build it](https://github.com/inertiajs/inertia/blob/master/.github/CONTRIBUTING.md#packages), and in your `package.json`, link it like this:

```js
{
  "devDependencies": {
    '@inertiajs/core': 'file:./repo/packages/core',
    '@inertiajs/svelte': 'file:./repo/packages/svelte',
    '@inertiajs/react': 'file:./repo/packages/react'
  }
}
```

Then run `npm install` again.

### Example

```html
<script>
import { Frame } from '@inertiajs/svelte'
</script>

<Frame src="/users/1/edit" id="edit_user">
  Loading...
</Frame>

<a href="/users/2/edit" data-target="edit_user">
  Edit a different user
</a>
```
