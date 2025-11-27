<script lang="ts">
  import { Deferred, router } from '@inertiajs/svelte'

  export let foo: { timestamp: string } | undefined
  export let bar: { timestamp: string } | undefined

  const reloadOnlyFoo = () => {
    router.reload({
      only: ['foo'],
    })
  }

  const reloadOnlyBar = () => {
    router.reload({
      only: ['bar'],
    })
  }

  const reloadBoth = () => {
    router.reload({
      only: ['foo', 'bar'],
    })
  }
</script>

<Deferred data="foo">
  <svelte:fragment slot="fallback">
    <div>Loading foo...</div>
  </svelte:fragment>
  <div id="foo-timestamp">{foo?.timestamp}</div>
</Deferred>

<Deferred data="bar">
  <svelte:fragment slot="fallback">
    <div>Loading bar...</div>
  </svelte:fragment>
  <div id="bar-timestamp">{bar?.timestamp}</div>
</Deferred>

<button on:click={reloadOnlyFoo}>Reload foo only</button>
<button on:click={reloadOnlyBar}>Reload bar only</button>
<button on:click={reloadBoth}>Reload both</button>
