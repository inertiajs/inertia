<script lang="ts">
  import { page } from '../index'

  export let data: string | string[]

  const keys = Array.isArray(data) ? data : [data]

  // Synchronously derive loaded state from current props
  // This ensures we never render slot content when props are undefined
  $: loaded = keys.every((key) => typeof $page.props[key] !== 'undefined')

  if (!$$slots.fallback) {
    throw new Error('`<Deferred>` requires a `<svelte:fragment slot="fallback">` slot')
  }
</script>

{#if loaded}
  <slot />
{:else}
  <slot name="fallback" />
{/if}
