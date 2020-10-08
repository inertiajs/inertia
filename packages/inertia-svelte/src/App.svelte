<script>
  import { Inertia } from '@inertiajs/inertia'
  import store from './store'
  import Render, { h } from './Render.svelte'

  export let
    initialPage,
    resolveComponent,
    transformProps = props => props

  Inertia.init({
    initialPage,
    resolveComponent,
    transformProps,
    swapComponent: async ({ component, page, preserveState }) => {
      store.update(current => ({
        component,
        page,
        key: preserveState ? current.key : Date.now(),
      }))
    },
  })

  $: child = $store.component && h($store.component.default, $store.page.props)
  $: layout = $store.component && $store.component.layout
  $: components = layout
    ? Array.isArray(layout)
      ? layout.concat(child).reverse().reduce((child, layout) => h(layout, {}, [child]))
      : h(layout, {}, [child])
    : child
</script>

<Render {...components} />
