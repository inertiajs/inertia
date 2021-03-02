<script>
  import store from './store'

  export let index = 0
  $: component = $store.layout[index]
    ? $store.layout[index]
    : $store.component.default
</script>

<svelte:component this={component} {...$store.page.props}>
  {#each $store.layout as layout, childIndex ($store.key)}
    <svelte:self {layout} index={childIndex + 1} />
  {/each}
</svelte:component>
