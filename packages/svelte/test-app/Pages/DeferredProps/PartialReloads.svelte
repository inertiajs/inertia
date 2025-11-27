<script lang="ts">
  import { Deferred, router } from '@inertiajs/svelte'

  interface Props {
    foo: { timestamp: string } | undefined
    bar: { timestamp: string } | undefined
  }

  let { foo, bar }: Props = $props()

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
  {#snippet fallback()}
    <div>Loading foo...</div>
  {/snippet}
  <div id="foo-timestamp">{foo?.timestamp}</div>
</Deferred>

<Deferred data="bar">
  {#snippet fallback()}
    <div>Loading bar...</div>
  {/snippet}
  <div id="bar-timestamp">{bar?.timestamp}</div>
</Deferred>

<button onclick={reloadOnlyFoo}>Reload foo only</button>
<button onclick={reloadOnlyBar}>Reload bar only</button>
<button onclick={reloadBoth}>Reload both</button>
