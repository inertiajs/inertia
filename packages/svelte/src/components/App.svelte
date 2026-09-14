<script module lang="ts">
  import { type ExternalNavigationOptions, type Page, type PageProps, type ServerHeadOption } from '@inertiajs/core'
  import type { ComponentResolver, ResolvedComponent } from '../types'

  export interface InertiaAppProps<SharedProps extends PageProps = PageProps> {
    initialComponent: ResolvedComponent
    initialPage: Page<SharedProps>
    resolveComponent: ComponentResolver
    defaultLayout?: (name: string, page: Page) => unknown
    serverHead?: ServerHeadOption
    externalNavigation?: ExternalNavigationOptions
  }
</script>

<script lang="ts">
  import {
    createHeadManager,
    isPropsObjectOrCallback,
    isPropsObject,
    normalizeLayouts,
    resolveServerHead,
    router,
  } from '@inertiajs/core'
  import { onDestroy, type Component } from 'svelte'
  import { resetLayoutProps, storeState } from '../layoutProps.svelte'
  import { setPage } from '../page.svelte'
  import type { LayoutType, LayoutResolver } from '../types'
  import Render, { h, type RenderProps } from './Render.svelte'

  interface Props {
    initialComponent: InertiaAppProps['initialComponent']
    initialPage: InertiaAppProps['initialPage']
    resolveComponent: InertiaAppProps['resolveComponent']
    defaultLayout?: InertiaAppProps['defaultLayout']
    serverHead?: InertiaAppProps['serverHead']
    externalNavigation?: InertiaAppProps['externalNavigation']
  }

  const { initialComponent, initialPage, resolveComponent, defaultLayout, serverHead, externalNavigation }: Props =
    $props()

  // svelte-ignore state_referenced_locally
  let component = $state(initialComponent)
  let key = $state<number | null>(null)
  // svelte-ignore state_referenced_locally
  let page = $state({ ...initialPage, flash: initialPage.flash ?? {} })
  let renderProps = $derived.by<RenderProps>(() => resolveRenderProps(component, page, key))

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
    if (externalNavigation) {
      resetLayoutProps()
    }

    // svelte-ignore state_referenced_locally
    const disposeRouter = router.init<ResolvedComponent>({
      initialPage,
      resolveComponent,
      externalNavigation,
      swapComponent: async (args) => {
        // Explicitly sync the global page store before swapping components,
        // ensuring the page store is up-to-date when the new component's
        // script block runs (necessary for async: true).
        setPage(args.page)
        component = args.component
        page = args.page
        key = args.preserveState ? key : Date.now()

        if (!args.preserveState) {
          resetLayoutProps()
        }
      },
      onFlash: (flash) => {
        page = { ...page, flash }
      },
    })

    // Mount options stay fixed for this app's lifetime.
    // svelte-ignore state_referenced_locally
    const serverHeadManager =
      externalNavigation && serverHead
        ? createHeadManager(
            false,
            (title) => title,
            () => {},
            resolveServerHead(initialPage, serverHead),
          )
        : null

    const syncServerHead = (event: { detail: { page: Page } }) => {
      serverHeadManager?.updateServerHead(resolveServerHead(event.detail.page, serverHead))
    }

    const removeNavigateListener = serverHeadManager ? router.on('navigate', syncServerHead) : () => {}
    const removeClientVisitListener = serverHeadManager ? router.on('clientVisit', syncServerHead) : () => {}

    // svelte-ignore state_referenced_locally
    if (externalNavigation) {
      onDestroy(() => {
        serverHeadManager?.dispose()
        disposeRouter()
        removeNavigateListener()
        removeClientVisitListener()
      })
    }
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

  function resolveRenderProps(component: ResolvedComponent, page: Page, key: number | null = null): RenderProps {
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
      ? resolveLayout(effectiveLayout, child, page.props, key, !!component.layout && !callbackProps, callbackProps)
      : child
  }

  function resolveLayout(
    layout: LayoutType,
    child: RenderProps,
    pageProps: PageProps,
    key: number | null,
    isFromPage: boolean = true,
    callbackProps: Record<string, unknown> | null = null,
  ): RenderProps {
    if (isFromPage && isRenderFunction(layout)) {
      return (layout as LayoutResolver)(h, child)
    }

    let layouts = normalizeLayouts(layout, isComponent, isFromPage ? isRenderFunction : undefined)

    if (callbackProps) {
      layouts = layouts.map((l) => ({ ...l, props: { ...l.props, ...callbackProps } }))
    }

    if (layouts.length > 0) {
      const dynamicProps = isServer ? { shared: {}, named: {} } : { shared: storeState.shared, named: storeState.named }

      return layouts.reduceRight((child, layout) => {
        return {
          ...h(
            layout.component,
            {
              ...pageProps,
              ...layout.props,
              ...dynamicProps.shared,
              ...(layout.name ? dynamicProps.named[layout.name] || {} : {}),
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
</script>

<Render {...renderProps} />
