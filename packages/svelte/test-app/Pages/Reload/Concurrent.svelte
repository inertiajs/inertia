<script lang="ts">
  import { router } from '@inertiajs/svelte'

  export let foo: string | undefined
  export let bar: string | undefined

  function reloadBothProps() {
    router.reload({ only: ['foo'] })
    setTimeout(() => router.reload({ only: ['bar'] }), 50)
  }
</script>

<div>
  <div id="foo">Foo: {foo}</div>
  <div id="bar">Bar: {bar}</div>

  <button on:click={reloadBothProps}>Reload both props</button>
</div>
