<script lang="ts">
  import { untrack } from 'svelte'
  import { page } from '../index'

  interface Props {
    data: string | string[]
    fallback?: import('svelte').Snippet
    children?: import('svelte').Snippet
  }

  let { data, fallback, children }: Props = $props()

  const keys = $derived(Array.isArray(data) ? data : [data])
  let loaded = $state(false)

  const isServer = typeof window === 'undefined'
  if (!isServer) {
    // Use $effect to watch for changes in pageState.props
    $effect(() => {
      // Access pageState.props to make this effect reactive
      const props = page.props

      // Wrap this up into untrack, to make sure it doesn't gets picked as a depedency to retrigger the $effect
      untrack(() => {
        // Ensures the content isn't loaded before the deferred props are available
        window.queueMicrotask(() => {
          loaded = keys.every((key) => typeof props[key] !== 'undefined')
        })
      })
    })
  }

  // svelte-ignore state_referenced_locally
  if (!fallback) {
    throw new Error('`<Deferred>` requires a `fallback` snippet')
  }
</script>

{#if loaded}
  {@render children?.()}
{:else}
  {@render fallback?.()}
{/if}
