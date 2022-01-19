<script>
  import store from './store'
  import Render, { h } from './Render.svelte'
  import { Inertia } from '@inertiajs/inertia'

  export let initialPage, resolveComponent, visitOptions

  Inertia.init({
    initialPage,
    resolveComponent,
    swapComponent: async ({ component, page, preserveState }) => {
      store.update((current) => ({
        component,
        page,
        key: preserveState ? current.key : Date.now()
      }))
    },
    visitOptions,
  })

  $: child = $store.component && h($store.component.default, $store.page.props)
  $: layout = $store.component && $store.component.layout
  $: components = layout
    ? Array.isArray(layout)
      ? layout
          .concat(child)
          .reverse()
          .reduce((child, layout) => h(layout, $store.page.props, [child]))
      : h(layout, $store.page.props, [child])
    : child
</script>

<Render {...components} />
