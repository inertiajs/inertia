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
  <span id="flash">{JSON.stringify(page.flash)}</span>

  <button onclick={setFlash}>Set flash</button>
  <button onclick={setFlashKeyValue}>Set flash key-value</button>
  <button onclick={mergeFlash}>Merge flash</button>
  <button onclick={clearFlash}>Clear flash</button>
</div>
