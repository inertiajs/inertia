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
    updatePage: async (component, props, { preserveState }) => {
      store.update(page => ({
        component,
        key: preserveState ? page.key : Date.now(),
        props: transformProps(props),
      }))
    },
  })

  $: page = $store.component && h($store.component.default, $store.props)
  $: layout = $store.component && $store.component.layout
  $: components = layout
    ? layout.name === 'layout' ? layout(h, page) : h(layout, [page])
    : page
</script>

<Render {...components} />
