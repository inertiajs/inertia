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

  $: child = $store.component && h($store.component.default, $store.props)
  $: layout = $store.component && $store.component.layout
  $: components = layout
    ? h(layout, {}, [child])
    : child
</script>

<Render {...components} />
