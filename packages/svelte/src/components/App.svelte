<script module lang="ts">
  import { type LoadingResolver, type Page, type PageProps, type ResolvedLayer } from '@inertiajs/core'
  import type { ComponentResolver, LayerComponent, ResolvedComponent } from '../types'

  export interface InertiaAppProps<SharedProps extends PageProps = PageProps> {
    initialComponent?: ResolvedComponent
    initialPage: Page<SharedProps>
    initialLayers?: ResolvedLayer<ResolvedComponent>[]
    resolveComponent: ComponentResolver
    resolveLoading?: LoadingResolver
    defaultLayout?: (name: string, page: Page) => unknown
    layer?: LayerComponent
  }
</script>

<script lang="ts">
  import { emptyLayoutSlot, layoutProps, resolveLayouts } from '@inertiajs/core'
  import type { LayoutSlot } from '@inertiajs/core'
  import { router } from '@inertiajs/core'
  import type { Component } from 'svelte'
  import { layerState, storeState, swapLayoutProps } from '../layoutProps.svelte'
  import { setPage } from '../page.svelte'
  import type { LayoutResolver } from '../types'
  import Layer from './Layer.svelte'
  import LayerPageContext from './LayerPageContext.svelte'
  import Render, { h, type RenderProps } from './Render.svelte'

  interface Props {
    initialComponent?: InertiaAppProps['initialComponent']
    initialPage: InertiaAppProps['initialPage']
    initialLayers?: InertiaAppProps['initialLayers']
    resolveComponent: InertiaAppProps['resolveComponent']
    resolveLoading?: InertiaAppProps['resolveLoading']
    defaultLayout?: InertiaAppProps['defaultLayout']
    layer?: InertiaAppProps['layer']
  }

  const {
    initialComponent,
    initialPage,
    initialLayers,
    resolveComponent,
    resolveLoading,
    defaultLayout,
    layer: LayerComponent = Layer,
  }: Props = $props()

  // svelte-ignore state_referenced_locally
  let component = $state(initialComponent)
  let key = $state<number | null>(null)
  // svelte-ignore state_referenced_locally
  let page = $state({ ...initialPage, flash: initialPage.flash ?? {} })
  // svelte-ignore state_referenced_locally
  let layers = $state<ResolvedLayer<ResolvedComponent>[]>(initialLayers ?? [])
  let renderProps = $derived.by<RenderProps | null>(() => (component ? resolveRenderProps(component, page, key) : null))

  // Synchronous initialization so the global page store is populated during SSR
  // ($effect.pre does not run during Svelte 5 SSR)
  // svelte-ignore state_referenced_locally
  setPage(page)

  // Reactively update the global page state when local page state changes
  $effect.pre(() => {
    setPage(page)
  })

  const isServer = typeof window === 'undefined'

  if (!isServer) {
    // svelte-ignore state_referenced_locally
    router.init<ResolvedComponent>({
      initialPage,
      resolveComponent,
      resolveLoading,
      swapComponent: async (args) => {
        // Explicitly sync the global page store before swapping components,
        // ensuring the page store is up-to-date when the new component's
        // script block runs (necessary for async: true).
        setPage(args.page)

        swapLayoutProps(args)

        component = args.component
        page = args.page
        layers = args.layers ?? []
        key = args.preserveState ? key : Date.now()
      },
      onFlash: (flash) => {
        page = { ...page, flash }
      },
    })
  }

  function isComponent(value: unknown): value is Component {
    if (!value) {
      return false
    }

    if (typeof value === 'function') {
      const fn = value as Function & { name?: string }
      return fn.name !== ''
    }

    if (typeof value === 'object' && '$$' in value) {
      return true
    }

    return false
  }

  function isRenderFunction(value: unknown): boolean {
    return (
      typeof value === 'function' &&
      (value as Function).length === 2 &&
      typeof (value as Function).prototype === 'undefined'
    )
  }

  const baseLayoutProps = () => (isServer ? emptyLayoutSlot : { shared: storeState.shared, named: storeState.named })
  const layerLayoutProps = (layerId: string) => () =>
    isServer ? emptyLayoutSlot : (layerState[layerId] ?? emptyLayoutSlot)

  function resolveRenderProps(
    component: ResolvedComponent,
    page: Page,
    key: number | null = null,
    dynamicProps: () => LayoutSlot = baseLayoutProps,
    layoutPage: Page = page,
  ): RenderProps {
    const child = h(component.default, page.props, [], key)

    if (component.layout && isRenderFunction(component.layout)) {
      return (component.layout as LayoutResolver)(h, child)
    }

    const layouts = resolveLayouts(component.layout, layoutPage, defaultLayout, {
      isComponent,
      isRenderFunction,
      rendersItself: isRenderFunction,
    })

    if (!Array.isArray(layouts)) {
      return (layouts.renders as LayoutResolver)(h, child)
    }

    const slot = dynamicProps()

    return layouts.reduceRight(
      (child, layout) => ({
        ...h(layout.component, layoutProps(layout, layoutPage, slot), [child], key),
        name: layout.name,
      }),
      child,
    )
  }

  function wrapLayerLayout(layer: ResolvedLayer<ResolvedComponent>): RenderProps {
    return resolveRenderProps(
      layer.component,
      layer.page,
      layer.renderKey,
      layerLayoutProps(layer.id),
      layer.layoutPage,
    )
  }
</script>

<!-- The stack starts on the page's line; a line break between them renders as a whitespace text node. -->
{#if renderProps}<Render {...renderProps} />{/if}{#each layers as layer (layer.id)}
  <LayerPageContext page={layer.page} layerId={layer.id}>
    <LayerComponent {...layer.shell}>
      <div {...layer.attributes} style:view-transition-name={layer.transitionName}>
        <Render {...wrapLayerLayout(layer)} />
      </div>
    </LayerComponent>
  </LayerPageContext>
{/each}
