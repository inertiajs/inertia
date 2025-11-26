<script module lang="ts">
  export { default as layout } from '@/Layouts/WithoutScrollRegion.svelte'
</script>

<script lang="ts">
  import { onMount } from 'svelte'
  import { inertia } from '@inertiajs/svelte'
  import type { Page } from '@inertiajs/core'

  interface Props {
    foo?: string
  }

  let { foo = 'default' }: Props = $props()

  const preserveCallback = (page: Page) => {
    alert(page)

    return true
  }

  const preserveCallbackFalse = (page: Page) => {
    alert(page)

    return false
  }

  onMount(() => {
    window._inertia_page_key = crypto.randomUUID()
  })
</script>

<div>
  <span class="text">This is the links page that demonstrates preserve state on Links</span>
  <span class="foo">Foo is now {foo}</span>
  <label>
    Example Field
    <input type="text" name="example-field" class="field" />
  </label>

  <a href="/links/preserve-state-page-two" use:inertia={{ preserveState: true, data: { foo: 'bar' } }} class="preserve">
    [State] Preserve: true
  </a>
  <a
    href="/links/preserve-state-page-two"
    use:inertia={{ preserveState: false, data: { foo: 'baz' } }}
    class="preserve-false"
  >
    [State] Preserve: false
  </a>
  <a
    href="/links/preserve-state-page-two"
    use:inertia={{ preserveState: preserveCallback, data: { foo: 'callback-bar' } }}
    class="preserve-callback"
  >
    [State] Preserve Callback: true
  </a>
  <a
    href="/links/preserve-state-page-two"
    use:inertia={{ preserveState: preserveCallbackFalse, data: { foo: 'callback-baz' } }}
    class="preserve-callback-false"
  >
    [State] Preserve Callback: false
  </a>
</div>
