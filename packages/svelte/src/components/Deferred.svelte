<script lang="ts">
  import { page } from '../index'
  import { onDestroy } from 'svelte'

  export let data: string | string[]

  const keys = Array.isArray(data) ? data : [data]
  let loaded = false

  const unsubscribe = page.subscribe(({ props }) => {
    // Ensures the slot isn't loaded before the deferred props are available
    window.queueMicrotask(() => {
      loaded = keys.every((key) => typeof props[key] !== 'undefined')
    })
  })

  onDestroy(() => {
    unsubscribe()
  })

  if (!$$slots.fallback) {
    throw new Error('`<Deferred>` requires a `<svelte:fragment slot="fallback">` slot')
  }
</script>

{#if loaded}
  <slot />
{:else}
  <slot name="fallback" />
{/if}
