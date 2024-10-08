<script context="module">
  export { default as layout } from '@/Layouts/WithoutScrollRegion.svelte'
</script>

<script>
  import { inertia } from '@inertiajs/svelte'

  export let foo = 'default'

  const preserveCallback = (page) => {
    console.log(JSON.stringify(page))

    return true
  }

  const preserveCallbackFalse = (page) => {
    console.log(JSON.stringify(page))

    return false
  }
</script>

<div style="height: 800px; width: 600px">
  <span class="text">This is the links page that demonstrates scroll preservation without scroll regions</span>
  <span class="foo">Foo is now {foo}</span>

  <a
    href="/links/preserve-scroll-false-page-two"
    use:inertia={{ preserveScroll: true, data: { foo: 'baz' } }}
    class="preserve"
    data-testid="preserve">Preserve Scroll</a
  >
  <a
    href="/links/preserve-scroll-false-page-two"
    use:inertia={{ data: { foo: 'bar' } }}
    class="reset"
    data-testid="reset">Reset Scroll</a
  >

  <a
    href="/links/preserve-scroll-false-page-two"
    use:inertia={{ preserveScroll: preserveCallback, data: { foo: 'baz' } }}
    class="preserve-callback"
    data-testid="preserve-callback">Preserve Scroll (Callback)</a
  >
  <a
    href="/links/preserve-scroll-false-page-two"
    use:inertia={{ preserveScroll: preserveCallbackFalse, data: { foo: 'foo' } }}
    class="reset-callback"
    data-testid="reset-callback">Reset Scroll (Callback)</a
  >

  <a href="/non-inertia" class="off-site">Off-site link</a>
</div>
