<script lang="ts">
  import Render, { h } from './Render.svelte'
  import store from '../store'

  $: child = $store.component?.default && h($store.component.default, $store.page?.props)
  $: layout = $store.component && $store.component.layout
  $: components = layout
    ? Array.isArray(layout)
      ? layout
          .concat(child)
          .reverse()
          .reduce((child, layout) => h(layout, $store.page?.props, [child]))
      : h(layout, $store.page?.props, child ? [child] : [])
    : child
</script>

<Render {...components} />
