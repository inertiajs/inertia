<script lang="ts">
  import { router } from '@inertiajs/svelte'

  export let foo: string | undefined
  export let bar: string | undefined
  export let timeframe: string | undefined

  function reloadBothPropsWithData() {
    router.reload({ only: ['foo'], data: { timeframe: 'week' } })
    setTimeout(() => router.reload({ only: ['bar'], data: { timeframe: 'week' } }), 50)
  }
</script>

<div>
  <div id="foo">Foo: {foo}</div>
  <div id="bar">Bar: {bar}</div>
  <div id="timeframe">Timeframe: {timeframe}</div>

  <button on:click={reloadBothPropsWithData}>Reload both props with data</button>
</div>
