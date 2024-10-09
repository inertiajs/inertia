<script lang="ts">
  import { page } from '../index'

  export let data: string | string[]

  const keys = Array.isArray(data) ? data : [data]

  if (!$$slots.fallback) {
    throw new Error('`<Deferred>` requires a `<svelte:fragment slot="fallback">` slot')
  }
</script>

{#if keys.every((key) => $page.props[key] !== undefined)}
  <slot />
{:else}
  <slot name="fallback" />
{/if}
