<script>
  import Render, { h } from './Render.svelte'
  import store from './store.svelte'

  let child = $derived(store.component && h(store.component.default, store.page.props))
  let layout = $derived(store.component && store.component.layout)
  let components = $derived(layout
    ? Array.isArray(layout)
      ? layout
          .concat(child)
          .reverse()
          .reduce((child, layout) => h(layout, store.page.props, [child]))
      : h(layout, store.page.props, [child])
    : child)
</script>

<Render {...components} />
