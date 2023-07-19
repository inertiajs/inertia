<script lang="ts">
  import { Page } from '@inertiajs/core'
  import { ComponentResolver } from '../types'
  import Render, { h } from './Render.svelte'
  import store from '../store'

  export const initialPage: Page = null
  export const resolveComponent: ComponentResolver = null

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
