<script lang="ts">
  import { onMount } from 'svelte'
  import { getHydrationContext } from '../hydration'

  interface Props {
    children?: import('svelte').Snippet
    fallback?: import('svelte').Snippet
  }

  let { children, fallback }: Props = $props()

  // The context is false only during the initial hydration render, so the fallback shows
  // there and the children show everywhere else, remounts included
  const hydration = getHydrationContext()

  let mounted = $state(hydration?.hydrated ?? false)

  onMount(() => {
    mounted = true
  })
</script>

{#if mounted}
  {@render children?.()}
{:else}
  {@render fallback?.()}
{/if}
