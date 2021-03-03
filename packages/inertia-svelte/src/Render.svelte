<script context="module">
  export const h = (component, props, children) => {
    return {
      component,
      ...(props ? { props } : {}),
      ...(children ? { children } : {})
    }
  }
</script>

<script>
  import store from './store'

  export let component
  export let props = {}
  export let children = []
</script>

{#if $store.component}
  <svelte:component this={component} {...props}>
    {#each children as child}
      <svelte:self {...child} />
    {/each}
  </svelte:component>
{/if}
