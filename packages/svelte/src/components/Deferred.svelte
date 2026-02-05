<script lang="ts">
  import { page } from '../index'

  interface Props {
    data: string | string[]
    fallback?: import('svelte').Snippet
    children?: import('svelte').Snippet
  }

  let { data, fallback, children }: Props = $props()

  const keys = $derived(Array.isArray(data) ? data : [data])
  const loaded = $derived(keys.every((key) => typeof page.props[key] !== 'undefined'))

  $effect.pre(() => {
    if (!fallback) {
      throw new Error('`<Deferred>` requires a `fallback` snippet')
    }
  })
</script>

{#if loaded}
  {@render children?.()}
{:else}
  {@render fallback?.()}
{/if}
