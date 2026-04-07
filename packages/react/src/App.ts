import {
  createHeadManager,
  HeadManagerOnUpdateCallback,
  HeadManagerTitleCallback,
  isPropsObject,
  isPropsObjectOrCallback,
  normalizeLayouts,
  Page,
  PageHandler,
  PageProps,
  router,
} from '@inertiajs/core'
import {
  createElement,
  FunctionComponent,
  isValidElement,
  ReactNode,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'
import { flushSync } from 'react-dom'
import HeadContext from './HeadContext'
import { resetLayoutProps, store } from './layoutProps'
import PageContext from './PageContext'
import { LayoutFunction, ReactComponent, ReactPageHandlerArgs } from './types'

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

function isLayoutResolver(value: unknown): boolean {
  return (
    typeof value === 'function' &&
    (value as Function).length <= 1 &&
    typeof (value as Function).prototype === 'undefined'
  )
}

let currentIsInitialPage = true
let routerIsInitialized = false
let swapComponent: PageHandler<ReactComponent> = async () => {
  // Dummy function so we can init the router outside of the useEffect hook. This is
  // needed so `router.reload()` works right away (on mount) in any of the user's
  // components. We swap in the real function in the useEffect hook below.
  currentIsInitialPage = false
}

type CurrentPage = {
  component: ReactComponent | null
  page: Page
  key: number | null
}

export interface InertiaAppProps<SharedProps extends PageProps = PageProps> {
  children?: (options: { Component: ReactComponent; props: PageProps; key: number | null }) => ReactNode
  initialPage: Page<SharedProps>
  initialComponent?: ReactComponent
  resolveComponent?: (name: string, page?: Page) => ReactComponent | Promise<ReactComponent>
  titleCallback?: HeadManagerTitleCallback
  onHeadUpdate?: HeadManagerOnUpdateCallback
  defaultLayout?: (name: string, page: Page) => unknown
}

export type InertiaApp = FunctionComponent<InertiaAppProps>

const emptySnapshot = {
  shared: {} as Record<string, unknown>,
  named: {} as Record<string, Record<string, unknown>>,
}

export default function App<SharedProps extends PageProps = PageProps>({
  children,
  initialPage,
  initialComponent,
  resolveComponent,
  titleCallback,
  onHeadUpdate,
  defaultLayout,
}: InertiaAppProps<SharedProps>) {
  const [current, setCurrent] = useState<CurrentPage>({
    component: initialComponent || null,
    page: { ...initialPage, flash: initialPage.flash ?? {} },
    key: null,
  })

  const headManager = useMemo(() => {
    return createHeadManager(
      typeof window === 'undefined',
      titleCallback || ((title) => title),
      onHeadUpdate || (() => {}),
    )
  }, [])

  const dynamicLayoutProps = useSyncExternalStore(store.subscribe, store.get, () => emptySnapshot)

  if (!routerIsInitialized) {
    router.init<ReactComponent>({
      initialPage,
      resolveComponent: resolveComponent!,
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
    swapComponent = async ({ component, page, preserveState }: ReactPageHandlerArgs) => {
      if (currentIsInitialPage) {
        // We block setting the current page on the initial page to
        // prevent the initial page from being re-rendered again.
        currentIsInitialPage = false
        return
      }

      if (!preserveState) {
        resetLayoutProps()
      }

      flushSync(() =>
        setCurrent((current) => ({
          component,
          page,
          key: preserveState ? current.key : Date.now(),
        })),
      )
    }

    router.on('navigate', () => headManager.forceUpdate())
  }, [])

  if (!current.component) {
    return createElement(
      HeadContext.Provider,
      { value: headManager },
      createElement(PageContext.Provider, { value: current.page }, null),
    )
  }

  const renderChildren =
    children ||
    (({ Component, props, key }) => {
      const child = createElement(Component, { key, ...props })

      let effectiveLayout: unknown
      let callbackProps: Record<string, unknown> | null = null
      const layoutValue = Component.layout

      if (isLayoutResolver(layoutValue)) {
        const result = (layoutValue as Function)(props)

        if (isValidElement(result)) {
          return (layoutValue as LayoutFunction)(child)
        }

        if (isPropsObjectOrCallback(result, isComponent)) {
          effectiveLayout = defaultLayout?.(current.page.component, current.page)
          callbackProps = result as Record<string, unknown>
        } else {
          effectiveLayout = result
        }
      } else if (isPropsObject(layoutValue, isComponent)) {
        effectiveLayout = defaultLayout?.(current.page.component, current.page)
        callbackProps = layoutValue as unknown as Record<string, unknown>
      } else {
        effectiveLayout = layoutValue ?? defaultLayout?.(current.page.component, current.page)
      }

      let layouts = normalizeLayouts(
        effectiveLayout,
        isComponent,
        layoutValue && !callbackProps ? isRenderFunction : undefined,
      )

      if (callbackProps) {
        layouts = layouts.map((l) => ({ ...l, props: { ...l.props, ...callbackProps } }))
      }

      if (layouts.length > 0) {
        return layouts.reduceRight((childNode, layout) => {
          return createElement(
            layout.component,
            {
              ...props,
              ...layout.props,
              ...dynamicLayoutProps.shared,
              ...(layout.name ? dynamicLayoutProps.named[layout.name] || {} : {}),
            },
            childNode,
          )
        }, child)
      }

      return child
    })

  return createElement(
    HeadContext.Provider,
    { value: headManager },
    createElement(
      PageContext.Provider,
      { value: current.page },
      renderChildren({
        Component: current.component,
        key: current.key,
        props: current.page.props,
      }),
    ),
  )
}

App.displayName = 'Inertia'
