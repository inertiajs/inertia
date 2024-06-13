<script context="module">
  export const h = (component, props, children) => {
    return {
      component,
      ...(props ? { props } : {}),
      ...(children ? { children } : {}),
    }
  }
</script>

<script>
  import store from './store'

  export let component
  export let props = {}
  export let children = []

  let prevComponent
  let key
  $: {
    if (prevComponent !== component) {
      key = Date.now()
      prevComponent = component
    }
  }
</script>

{#if $store.component}
  {#key key}
    <svelte:component this={component} {...props}>
      {#each children as child, index (component && component.length === index ? $store.key : null)}
        <svelte:self {...child} />
      {/each}
    </svelte:component>
  {/key}
{/if}
