# Inertia with Frames

This is a modified version of [Inertia](https://github.com/inertiajs/inertia) that adds support for Frames.

This is experimental and currently only supported in Svelte.

## Frames

This fork introduces the `<Frame>` component. This component is used to encapsulate an Inertia page within another Inertia page. This is useful for creating modal dialogs, popovers, etc.

By default, hyperlinks and form submissions will load the response within the current frame. To load the response in a different frame, use the `target` attribute. To load the response in the main 

### Example

```html
<script>
import { Frame } from '@inertia/svelte'
</script>

<Frame src="/users/1/edit">
  Loading...
</Frame>
```
