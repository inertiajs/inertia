<script context="module">
  export { default as layout } from '@/Layouts/WithoutScrollRegion.svelte'
</script>

<script>
  import { onMount } from 'svelte'
  import { inertia } from 'inertiax-svelte'

  export let foo = 'default'

  const preserveCallback = (page) => {
    alert(page)

    return true
  }

  const preserveCallbackFalse = (page) => {
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

  <a href="/links/preserve-state-page-two" use:inertia={{ forgetState: false, data: { foo: 'bar' } }} class="preserve">
    [State] Preserve: true
  </a>
  <a
    href="/links/preserve-state-page-two"
    use:inertia={{ forgetState: true, data: { foo: 'baz' } }}
    class="preserve-false"
  >
    [State] Preserve: false
  </a>
  <a
    href="/links/preserve-state-page-two"
    use:inertia={{ forgetState: preserveCallback, data: { foo: 'callback-bar' } }}
    class="preserve-callback"
  >
    [State] Preserve Callback: true
  </a>
  <a
    href="/links/preserve-state-page-two"
    use:inertia={{ forgetState: preserveCallbackFalse, data: { foo: 'callback-baz' } }}
    class="preserve-callback-false"
  >
    [State] Preserve Callback: false
  </a>
</div>
