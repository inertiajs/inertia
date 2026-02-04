<script lang="ts">
  import { router } from '@inertiajs/svelte'

  let { foo, bar, timeframe }: { foo?: string; bar?: string; timeframe?: string } = $props()

  function reloadBothPropsWithData() {
    router.reload({ only: ['foo'], data: { timeframe: 'week' } })
    setTimeout(() => router.reload({ only: ['bar'], data: { timeframe: 'week' } }), 50)
  }
</script>

<div>
  <div id="foo">Foo: {foo}</div>
  <div id="bar">Bar: {bar}</div>
  <div id="timeframe">Timeframe: {timeframe}</div>

  <button onclick={reloadBothPropsWithData}>Reload both props with data</button>
</div>
