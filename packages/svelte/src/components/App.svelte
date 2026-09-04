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
  import {
    emptyLayoutSlot,
    isPropsObjectOrCallback,
    isPropsObject,
    layerShellProps,
    layerTransitionName,
    layoutPageOf,
    normalizeLayouts,
  } from '@inertiajs/core'
  import type { LayoutSlot } from '@inertiajs/core'
  import { router } from '@inertiajs/core'
  import type { Component } from 'svelte'
  import { layerState, resetLayoutProps, retainLayerLayoutProps, storeState } from '../layoutProps.svelte'
  import { setPage } from '../page.svelte'
  import type { LayoutType, LayoutResolver } from '../types'
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

        if (!args.preserveState) {
          resetLayoutProps()
        }

        retainLayerLayoutProps((args.layers ?? []).map((layer) => layer.id))

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
  ): RenderProps {
    const child = h(component.default, page.props, [], key)

    if (component.layout && isRenderFunction(component.layout)) {
      return (component.layout as LayoutResolver)(h, child)
    }

    let effectiveLayout: LayoutType | undefined
    let callbackProps: Record<string, unknown> | null = null
    const layoutValue = component.layout

    if (
      typeof layoutValue === 'function' &&
      (layoutValue as Function).length <= 1 &&
      typeof (layoutValue as Function).prototype === 'undefined'
    ) {
      const result = (layoutValue as Function)(page.props)

      if (isPropsObjectOrCallback(result, isComponent)) {
        effectiveLayout = defaultLayout?.(page.component, page) as LayoutType | undefined
        callbackProps = result as Record<string, unknown>
      } else {
        effectiveLayout = result as LayoutType | undefined
      }
    } else if (isPropsObject(layoutValue, isComponent)) {
      effectiveLayout = defaultLayout?.(page.component, page) as LayoutType | undefined
      callbackProps = layoutValue as Record<string, unknown>
    } else {
      effectiveLayout = (layoutValue ?? defaultLayout?.(page.component, page)) as LayoutType | undefined
    }

    return effectiveLayout
      ? resolveLayout(
          effectiveLayout,
          child,
          page.props,
          key,
          !!component.layout && !callbackProps,
          callbackProps,
          dynamicProps,
        )
      : child
  }

  function resolveLayout(
    layout: LayoutType,
    child: RenderProps,
    pageProps: PageProps,
    key: number | null,
    isFromPage: boolean = true,
    callbackProps: Record<string, unknown> | null = null,
    dynamicProps: () => LayoutSlot = baseLayoutProps,
  ): RenderProps {
    if (isFromPage && isRenderFunction(layout)) {
      return (layout as LayoutResolver)(h, child)
    }

    let layouts = normalizeLayouts(layout, isComponent, isFromPage ? isRenderFunction : undefined)

    if (callbackProps) {
      layouts = layouts.map((l) => ({ ...l, props: { ...l.props, ...callbackProps } }))
    }

    if (layouts.length > 0) {
      const slot = dynamicProps()

      return layouts.reduceRight((child, layout) => {
        return {
          ...h(
            layout.component,
            {
              ...pageProps,
              ...layout.props,
              ...slot.shared,
              ...(layout.name ? slot.named[layout.name] || {} : {}),
            },
            [child],
            key,
          ),
          name: layout.name,
        }
      }, child)
    }

    return child
  }

  function wrapLayerLayout(layer: ResolvedLayer<ResolvedComponent>): RenderProps {
    return resolveRenderProps(layer.component, layoutPageOf(layer), layer.renderKey, layerLayoutProps(layer.id))
  }
</script>

<!-- The stack starts on the same line as the page. A line break between them renders as a
     whitespace text node, which every app would then carry whether it uses layers or not. -->
{#if renderProps}<Render {...renderProps} />{/if}{#each layers as layer, index (layer.id)}
  <LayerPageContext page={layer.page} layerId={layer.id}>
    <LayerComponent {...layerShellProps(layer, index, layers.length)}>
      <div data-layer-id={layer.id} style:view-transition-name={layerTransitionName(layer.id)}>
        <Render {...wrapLayerLayout(layer)} />
      </div>
    </LayerComponent>
  </LayerPageContext>
{/each}
