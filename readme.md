# Inertia with Frames

This is a modified version of [Inertia](https://github.com/inertiajs/inertia) that adds support for Frames.

This is experimental and currently only supported in Svelte and React.

## Frames

This fork introduces the `<Frame>` component. This component is used to encapsulate an Inertia page within another Inertia page. This is useful for creating modal dialogs, wizards, search sidebars, popovers, etc.

By default, hyperlinks and form submissions will load the response within the frame that contains the link or the form. To load the response in a different frame, add a `data-target` attribute. To load the response in the top (main) frame, use the `data=target="_top"` attribute.

You can overwrite the targeted frame in the server-side response by sending an 'X-Inertia-Frame' header.

Navigation within frames does not create new history entries. To enable this, a more substantial rewrite of the Inertia router would be required.

### Installation

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
