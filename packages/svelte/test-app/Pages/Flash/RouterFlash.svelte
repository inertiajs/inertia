<script lang="ts">
  import { router, page } from '@inertiajs/svelte'

  const setFlash = () => {
    router.flash({ foo: 'bar' })
  }

  const setFlashKeyValue = () => {
    router.flash('foo', 'bar')
  }

  const mergeFlash = () => {
    router.flash((current) => ({ ...current, bar: 'baz' }))
  }

  const clearFlash = () => {
    router.flash(() => ({}))
  }
</script>

<div>
  <span id="flash">{JSON.stringify($page.flash)}</span>

  <button on:click={setFlash}>Set flash</button>
  <button on:click={setFlashKeyValue}>Set flash key-value</button>
  <button on:click={mergeFlash}>Merge flash</button>
  <button on:click={clearFlash}>Clear flash</button>
</div>
