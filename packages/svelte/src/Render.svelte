<script context="module">
  export const h = (component, props, childComponents) => {
    return {
      component,
      ...(props ? { props } : {}),
      ...(childComponents ? { childComponents } : {}),
    }
  }
</script>

<script>
  import store from './store.svelte'

  let {
    component,
    props = {},
    childComponents = [],
  } = $props()

  let prevComponent
  let key

  $effect(() => {
    if (prevComponent !== component) {
      key = Date.now()
      prevComponent = component
    }
  });
</script>

{#if store.component}
  {#key key}
    <svelte:component this={component} {...props}>
      {#each childComponents as child, index (component && component.length === index ? store.key : null)}
        <svelte:self {...child} />
      {/each}
    </svelte:component>
  {/key}
{/if}
