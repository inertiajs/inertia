<script module lang="ts">
  import type { ComponentResolver, ResolvedComponent } from '../types'
  import { type Page, type PageProps } from '@inertiajs/core'

  export interface InertiaAppProps<SharedProps extends PageProps = PageProps> {
    initialComponent: ResolvedComponent
    initialPage: Page<SharedProps>
    resolveComponent: ComponentResolver
  }
</script>

<script lang="ts">
  import type { LayoutType, LayoutResolver } from '../types'
  import { router } from '@inertiajs/core'
  import Render, { h, type RenderProps } from './Render.svelte'
  import { setPage } from '../page.svelte'

  interface Props {
    initialComponent: InertiaAppProps['initialComponent']
    initialPage: InertiaAppProps['initialPage']
    resolveComponent: InertiaAppProps['resolveComponent']
  }

  const { initialComponent, initialPage, resolveComponent }: Props = $props()

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
      },
      onFlash: (flash) => {
        page = { ...page, flash }
      },
    })
  }

  /**
   * Resolves the render props for the current page component, including layouts.
   */
  function resolveRenderProps(component: ResolvedComponent, page: Page, key: number | null = null): RenderProps {
    // If the component does not exists, it will throw on component.default and component.layout here
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
    if (isLayoutFunction(layout)) {
      return layout(h, child)
    }

    if (Array.isArray(layout)) {
      return layout
        .slice()
        .reverse()
        .reduce((currentRender, layoutComponent) => h(layoutComponent, pageProps, [currentRender], key), child)
    }

    return h(layout, pageProps, child ? [child] : [], key)
  }

  /**
   * Type guard to check if layout is a LayoutResolver
   */
  function isLayoutFunction(layout: LayoutType): layout is LayoutResolver {
    return typeof layout === 'function' && layout.length === 2 && typeof layout.prototype === 'undefined'
  }
</script>

<Render {...renderProps} />
