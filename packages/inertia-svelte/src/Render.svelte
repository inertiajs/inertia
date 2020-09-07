<script context="module">
  export const h = (component, props, children) => {
    if (props && Array.isArray(props) && !children) {
      children = props
      props = null
    }

    if (children && ! Array.isArray(children)) {
      children = [children]
    }

    return {
      component,
      ...(props ? { props } : {}),
      ...(children ? { children } : {})
    }
  }
</script>

<script>
  export let component
  export let props = {}
  export let children = []

  $: normalizedChildren = component && children.map(child => {
    return typeof child === 'function' ? h(child) : child
  })
</script>

{#if component}
  <svelte:component this={component} {...props}>
    {#each normalizedChildren as child}
      <svelte:self {...child} />
    {/each}
  </svelte:component>
{/if}
