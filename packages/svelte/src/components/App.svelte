<script lang="ts">
  import type { LayoutType } from '../types'
  import type { PageProps } from '@inertiajs/core'
  import type { RenderProps } from './Render.svelte'
  import Render, { h } from './Render.svelte'
  import store, { type InertiaStore } from '../store'

  $: props = resolveProps($store)

  /**
   * Resolves the render props for the current page component, including layouts.
   */
  function resolveProps({ component, page, key = null }: InertiaStore): RenderProps {
    const child = h(component.default, page.props, [], key)
    const layout = component.layout

    return layout ? resolveLayout(layout, child, page.props, key) : child
  }

  /**
   * Builds the nested layout structure by wrapping the child component with the provided layouts.
   *
   * Resulting nested structure:
   *
   *    {
   *      "component": OuterLayout,
   *      "key": 123456,
   *      "children": [{
   *        "component": InnerLayout,
   *        "key": 123456,
   *        "children": [{
   *          "component": PageComponent,
   *          "key": 123456,
   *          "children": [],
   *        }],
   *      }],
   *    }
   */
  function resolveLayout(
    layout: LayoutType,
    child: RenderProps,
    pageProps: PageProps,
    key: number | null,
  ): RenderProps {
    if (Array.isArray(layout)) {
      return layout
        .slice()
        .reverse()
        .reduce((currentRender, layoutComponent) => h(layoutComponent, pageProps, [currentRender], key), child)
    }

    return h(layout, pageProps, child ? [child] : [], key)
  }
</script>

{#if props}
  <Render {...props} />
{/if}
