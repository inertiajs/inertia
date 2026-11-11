<script module lang="ts">
  import { type Page, type PageProps } from '@inertiajs/core'
  import type { ComponentResolver, ResolvedComponent } from '../types'

  export interface InertiaAppProps<SharedProps extends PageProps = PageProps> {
    initialComponent: ResolvedComponent
    initialPage: Page<SharedProps>
    resolveComponent: ComponentResolver
    defaultLayout?: (name: string, page: Page) => unknown
    serverRendered?: boolean
  }
</script>

<script lang="ts">
  import { isPropsObjectOrCallback, isPropsObject, normalizeLayouts } from '@inertiajs/core'
  import { router } from '@inertiajs/core'
  import { isEqual } from 'es-toolkit'
  import { onMount } from 'svelte'
  import type { Component } from 'svelte'
  import { setHydrationContext } from '../hydration'
  import { resetLayoutProps, storeState } from '../layoutProps.svelte'
  import { setPage } from '../page.svelte'
  import type { LayoutType, LayoutResolver } from '../types'
  import Render, { h, type RenderProps } from './Render.svelte'

  interface Props {
    initialComponent: InertiaAppProps['initialComponent']
    initialPage: InertiaAppProps['initialPage']
    resolveComponent: InertiaAppProps['resolveComponent']
    defaultLayout?: InertiaAppProps['defaultLayout']
    serverRendered?: boolean
  }

  const { initialComponent, initialPage, resolveComponent, defaultLayout, serverRendered = true }: Props = $props()

  // svelte-ignore state_referenced_locally
  let component = $state(initialComponent)
  let key = $state<number | null>(null)
  // Raw, so core's objects are not wrapped in a new proxy on every swap
  // svelte-ignore state_referenced_locally
  let page = $state.raw({ ...initialPage, flash: initialPage.flash ?? {} })
  // svelte-ignore state_referenced_locally
  let pageProps = $state<Page['props']>({ ...initialPage.props })
  let renderProps = $derived.by<RenderProps>(() => resolveRenderProps(component, page, pageProps, key))

  function writePageProps(props: Page['props'], previous: Page['props'], remount: boolean): void {
    if (remount) {
      pageProps = { ...props }
      return
    }

    for (const [name, value] of Object.entries(props)) {
      // A kept reference is written again if the proxy was changed locally since core sent it
      if (!(name in previous) || previous[name] !== value || !isEqual($state.snapshot(pageProps[name]), value)) {
        pageProps[name] = value
      }
    }

    for (const name of Object.keys(previous)) {
      if (!(name in props)) {
        delete pageProps[name]
      }
    }
  }

  // Synchronous initialization so the global page store is populated during SSR
  // ($effect.pre does not run during Svelte 5 SSR)
  // svelte-ignore state_referenced_locally
  setPage({ ...page, props: pageProps })

  // Reactively update the global page state when local page state changes
  $effect.pre(() => {
    setPage({ ...page, props: pageProps })
  })

  const isServer = typeof window === 'undefined'

  // Scoped per app instance so multiple Inertia roots on one page don't clobber each other
  // svelte-ignore state_referenced_locally
  const hydration = $state({ hydrated: !serverRendered })
  setHydrationContext(hydration)

  if (!isServer) {
    onMount(() => (hydration.hydrated = true))

    // svelte-ignore state_referenced_locally
    router.init<ResolvedComponent>({
      initialPage,
      resolveComponent,
      swapComponent: async (args) => {
        const remount = !args.preserveState || args.component.default !== component.default
        writePageProps(args.page.props, page.props, remount)
        // Explicitly sync the global page store before swapping components,
        // ensuring the page store is up-to-date when the new component's
        // script block runs (necessary for async: true).
        setPage({ ...args.page, props: pageProps })
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

  function resolveRenderProps(
    component: ResolvedComponent,
    page: Page,
    pageProps: PageProps,
    key: number | null = null,
  ): RenderProps {
    const child = h(component.default, pageProps, [], key)

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
      const result = (layoutValue as Function)(pageProps)

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
      ? resolveLayout(effectiveLayout, child, pageProps, key, !!component.layout && !callbackProps, callbackProps)
      : child
  }

  let layoutPropsCache: {
    component: unknown
    source: PageProps
    keys: string
    extra: Record<string, unknown>
    props: PageProps
  }[] = []

  // Same props object while the layout's own props are unchanged; page props are read through getters
  function layoutProps(
    index: number,
    component: unknown,
    pageProps: PageProps,
    extra: Record<string, unknown>,
  ): PageProps {
    const keys = Object.keys(pageProps).join('\0')
    const cached = layoutPropsCache[index]

    if (
      cached &&
      cached.component === component &&
      cached.source === pageProps &&
      cached.keys === keys &&
      Object.keys(extra).length === Object.keys(cached.extra).length &&
      Object.entries(extra).every(([name, value]) => name in cached.extra && cached.extra[name] === value)
    ) {
      return cached.props
    }

    const props: PageProps = {}

    for (const name of Object.keys(pageProps)) {
      if (!(name in extra)) {
        Object.defineProperty(props, name, { get: () => pageProps[name], enumerable: true, configurable: true })
      }
    }

    Object.assign(props, extra)
    layoutPropsCache[index] = { component, source: pageProps, keys, extra, props }

    return props
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

      return layouts.reduceRight((child, layout, index) => {
        return {
          ...h(
            layout.component,
            layoutProps(index, layout.component, pageProps, {
              ...layout.props,
              ...dynamicProps.shared,
              ...(layout.name ? dynamicProps.named[layout.name] || {} : {}),
            }),
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
