<script lang="ts">
  import { pageState } from '../page.svelte'

  const { data, children, fallback }: { 
    data: string | string[]
    children?: any
    fallback?: any
  } = $props()

  const keys = Array.isArray(data) ? data : [data]
  let loaded = $state(false)

  const isServer = typeof window === 'undefined'

  if (!isServer) {
    // Use $effect to watch for changes in pageState.props
    $effect(() => {
      // Ensures the content isn't loaded before the deferred props are available
      window.queueMicrotask(() => {
        loaded = keys.every((key) => typeof pageState.props[key] !== 'undefined')
      })
    })
  }

  if (!fallback) {
    throw new Error('`<Deferred>` requires a `fallback` snippet')
  }
</script>

{#if loaded}
  {@render children?.()}
{:else}
  {@render fallback?.()}
{/if}
