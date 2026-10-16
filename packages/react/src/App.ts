import {
  createHeadManager,
  emptyLayoutSlot,
  HeadManagerOnUpdateCallback,
  HeadManagerTitleCallback,
  layoutProps,
  LayoutSlot,
  LoadingResolver,
  Page,
  PageHandler,
  PageProps,
  ResolvedLayer,
  resolveLayouts,
  resolveServerHead,
  router,
  topPageOf,
  type ServerHeadOption,
} from '@inertiajs/core'
import {
  createElement,
  Fragment,
  FunctionComponent,
  isValidElement,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { flushSync } from 'react-dom'
import HeadContext from './HeadContext'
import Layer from './Layer'
import { store, swapLayoutProps } from './layoutProps'
import PageContext from './PageContext'
import { LayerComponent, LayoutFunction, ReactComponent, ReactPageHandlerArgs } from './types'
import { layerContext } from './useLayer'

function isComponent(value: unknown): value is ReactComponent {
  return typeof value === 'function' || (typeof value === 'object' && value !== null && '$$typeof' in value)
}

function isRenderFunction(value: unknown): boolean {
  if (typeof value !== 'function') {
    return false
  }

  const fn = value as Function
  return fn.length === 1 && typeof fn.prototype === 'undefined'
}

let pendingInitialSwap: ReactPageHandlerArgs | null = null
let routerIsInitialized = false
let swapComponent: PageHandler<ReactComponent> = async (args) => {
  // Dummy function so we can init the router outside of the useEffect hook. This is
  // needed so `router.reload()` works right away (on mount) in any of the user's
  // components. We swap in the real function in the useEffect hook below.
  // The router can swap before that (e.g. a back_forward visit that restores a page
  // from history), so we remember it here and replay it once the real function is in
  // place instead of dropping the swap.
  pendingInitialSwap = args
}

type CurrentPage = {
  component: ReactComponent | null
  page: Page
  layers: ResolvedLayer<ReactComponent>[]
  key: number | null
}

export interface InertiaAppProps<SharedProps extends PageProps = PageProps> {
  children?: (options: { Component: ReactComponent; props: PageProps; key: number | null }) => ReactNode
  initialPage: Page<SharedProps>
  initialComponent?: ReactComponent
  initialLayers?: ResolvedLayer<ReactComponent>[]
  resolveComponent?: (name: string, page?: Page) => ReactComponent | Promise<ReactComponent>
  titleCallback?: HeadManagerTitleCallback
  onHeadUpdate?: HeadManagerOnUpdateCallback
  defaultLayout?: (name: string, page: Page) => unknown
  layer?: LayerComponent
  resolveLoading?: LoadingResolver
  serverHead?: ServerHeadOption
}

export type InertiaApp = FunctionComponent<InertiaAppProps>

function renderLayout(
  component: ReactComponent,
  page: Page,
  child: ReactNode,
  dynamicProps: LayoutSlot,
  defaultLayout?: (name: string, page: Page) => unknown,
): ReactNode {
  const layouts = resolveLayouts(component.layout, page, defaultLayout, {
    isComponent,
    isRenderFunction,
    rendersItself: isValidElement,
  })

  if (!Array.isArray(layouts)) {
    return (component.layout as LayoutFunction)(child)
  }

  return layouts.reduceRight(
    (childNode, layout) => createElement(layout.component, layoutProps(layout, page, dynamicProps), childNode),
    child,
  )
}

function LayerLayout({
  layer,
  defaultLayout,
}: {
  layer: ResolvedLayer<ReactComponent>
  defaultLayout?: (name: string, page: Page) => unknown
}) {
  const layerLayoutProps = useSyncExternalStore(
    store.subscribe,
    () => store.getForLayer(layer.id),
    () => emptyLayoutSlot,
  )

  return renderLayout(
    layer.component,
    layer.layoutPage,
    createElement(layer.component, { key: layer.renderKey, ...layer.page.props }),
    layerLayoutProps,
    defaultLayout,
  )
}

export default function App<SharedProps extends PageProps = PageProps>({
  children,
  initialPage,
  initialComponent,
  initialLayers,
  resolveComponent,
  titleCallback,
  onHeadUpdate,
  defaultLayout,
  layer: LayerComponent = Layer,
  resolveLoading,
  serverHead,
}: InertiaAppProps<SharedProps>) {
  const [current, setCurrent] = useState<CurrentPage>({
    component: initialComponent || null,
    page: { ...initialPage, flash: initialPage.flash ?? {} },
    layers: initialLayers ?? [],
    key: null,
  })

  const pageRef = useRef(current.page)
  pageRef.current = current.page

  const headManager = useMemo(() => {
    return createHeadManager(
      typeof window === 'undefined',
      (title: string) => (titleCallback ? titleCallback(title, topPageOf(pageRef.current)) : title),
      onHeadUpdate || (() => {}),
      resolveServerHead(initialPage, serverHead),
      () => pageRef.current.layers ?? [],
    )
  }, [])

  const dynamicLayoutProps = useSyncExternalStore(store.subscribe, store.get, () => emptyLayoutSlot)

  if (!routerIsInitialized) {
    router.init<ReactComponent>({
      initialPage,
      resolveComponent: resolveComponent!,
      resolveLoading,
      swapComponent: async (args) => swapComponent(args),
      onFlash: (flash) => {
        setCurrent((current) => ({
          ...current,
          page: { ...current.page, flash },
        }))
      },
    })

    routerIsInitialized = true
  }

  useEffect(() => {
    swapComponent = async ({ component, page, layers, preserveState, initialRender }: ReactPageHandlerArgs) => {
      if (initialRender) {
        // We block setting the current page on the initial page to
        // prevent the initial page from being re-rendered again.
        return
      }

      const nextLayers = layers ?? []

      swapLayoutProps({ layers: nextLayers, preserveState })

      flushSync(() =>
        setCurrent((current) => ({
          component: component ?? null,
          page,
          layers: nextLayers,
          key: preserveState ? current.key : Date.now(),
        })),
      )
    }

    // Replay the swap the dummy function above captured before we got here, if any.
    if (pendingInitialSwap) {
      const pending = pendingInitialSwap
      pendingInitialSwap = null
      swapComponent(pending)
    }

    const syncServerHead = (event: { detail: { page: Page } }) => {
      headManager.updateServerHead(resolveServerHead(event.detail.page, serverHead))
    }

    const removeNavigateListener = router.on('navigate', syncServerHead)
    const removeClientVisitListener = router.on('clientVisit', syncServerHead)

    return () => {
      removeNavigateListener()
      removeClientVisitListener()
    }
  }, [])

  const renderChildren =
    children ||
    (({ Component, props, key }) =>
      renderLayout(
        Component,
        current.page,
        createElement(Component, { key, ...props }),
        dynamicLayoutProps,
        defaultLayout,
      ))

  return createElement(
    HeadContext.Provider,
    { value: headManager },
    createElement(
      PageContext.Provider,
      { value: current.page },
      createElement(
        Fragment,
        null,
        current.component
          ? renderChildren({
              Component: current.component,
              key: current.key,
              props: current.page.props,
            })
          : null,
        ...current.layers.map((layer) =>
          createElement(
            layerContext.Provider,
            { key: layer.id, value: layer.id },
            createElement(
              PageContext.Provider,
              { value: layer.page },
              createElement(
                LayerComponent,
                layer.shell,
                createElement(
                  'div',
                  { ...layer.attributes, style: { viewTransitionName: layer.transitionName } },
                  createElement(LayerLayout, { layer, defaultLayout }),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  )
}

App.displayName = 'Inertia'
