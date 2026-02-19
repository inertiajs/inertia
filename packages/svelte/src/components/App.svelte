<script module lang="ts">
  import type { ComponentResolver, ResolvedComponent } from '../types'
  import { type Page, type PageProps } from '@inertiajs/core'

  export interface InertiaAppProps<SharedProps extends PageProps = PageProps> {
    initialComponent: ResolvedComponent
    initialPage: Page<SharedProps>
    resolveComponent: ComponentResolver
    defaultLayout?: (name: string, page: Page) => unknown
  }
</script>

<script lang="ts">
  import type { Component } from 'svelte'
  import type { LayoutType, LayoutResolver } from '../types'
  import { normalizeLayouts } from '@inertiajs/core'
  import { router } from '@inertiajs/core'
  import Render, { h, type RenderProps } from './Render.svelte'
  import { setPage } from '../page.svelte'
  import { resetLayoutProps } from '../layoutProps.svelte'

  interface Props {
    initialComponent: InertiaAppProps['initialComponent']
    initialPage: InertiaAppProps['initialPage']
    resolveComponent: InertiaAppProps['resolveComponent']
    defaultLayout?: InertiaAppProps['defaultLayout']
  }

  const { initialComponent, initialPage, resolveComponent, defaultLayout }: Props = $props()

  // svelte-ignore state_referenced_locally
  let component = $state(initialComponent)
  let key = $state<number | null>(null)
  // svelte-ignore state_referenced_locally
  let page = $state({ ...initialPage, flash: initialPage.flash ?? {} })
  let renderProps = $derived.by<RenderProps>(() => resolveRenderProps(component, page, key))

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
      swapComponent: async (args) => {
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

  function resolveRenderProps(component: ResolvedComponent, page: Page, key: number | null = null): RenderProps {
    const child = h(component.default, page.props, [], key)

    if (component.layout && isRenderFunction(component.layout)) {
      return (component.layout as LayoutResolver)(h, child)
    }

    const effectiveLayout = (component.layout ?? defaultLayout?.(page.component, page)) as LayoutType | undefined

    return effectiveLayout ? resolveLayout(effectiveLayout, child, page.props, key, !!component.layout) : child
  }

  function resolveLayout(
    layout: LayoutType,
    child: RenderProps,
    pageProps: PageProps,
    key: number | null,
    isFromPage: boolean = true,
  ): RenderProps {
    if (isFromPage && isRenderFunction(layout)) {
      return (layout as LayoutResolver)(h, child)
    }

    const layouts = normalizeLayouts(layout, isComponent, isFromPage ? isRenderFunction : undefined)

    if (layouts.length > 0) {
      return layouts.reduceRight((child, layout) => {
        return {
          ...h(layout.component, { ...pageProps, ...layout.props }, [child], key),
          name: layout.name,
        }
      }, child)
    }

    return child
  }
</script>

<Render {...renderProps} />
