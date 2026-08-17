<script lang="ts">
  interface Props {
    children?: import('svelte').Snippet
    fallback?: import('svelte').Snippet
  }

  let { children, fallback }: Props = $props()

  // Not a `typeof window` check: the client's first render must match the server's
  // HTML, so the swap has to wait for mount.
  let mounted = $state(false)

  $effect(() => {
    mounted = true
  })
</script>

{#if mounted}
  {@render children?.()}
{:else}
  {@render fallback?.()}
{/if}
