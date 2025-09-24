<script lang="ts">
  import { pageState } from '../page.svelte'

  const {
    data,
    children,
    fallback,
  }: {
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
      // Access pageState.props to make this effect reactive
      const props = pageState.props

      // Ensures the content isn't loaded before the deferred props are available
      window.queueMicrotask(() => {
        const newLoaded = keys.every((key) => typeof props[key] !== 'undefined')
        loaded = newLoaded
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
