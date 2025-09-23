<script lang="ts">
  import { page } from '../index'

  const { data }: { data: string | string[] } = $props()

  const keys = Array.isArray(data) ? data : [data]
  let loaded = $state(false)

  const isServer = typeof window === 'undefined'

  if (!isServer) {
    // Use $effect to watch for changes in page.props
    $effect(() => {
      // Ensures the slot isn't loaded before the deferred props are available
      window.queueMicrotask(() => {
        loaded = keys.every((key) => typeof page.props[key] !== 'undefined')
      })
    })
  }

  if (!$$slots.fallback) {
    throw new Error('`<Deferred>` requires a `<svelte:fragment slot="fallback">` slot')
  }
</script>

{#if loaded}
  <slot />
{:else}
  <slot name="fallback" />
{/if}
