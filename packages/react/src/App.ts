import { createHeadManager, Page, PageHandler, PageProps, router } from '@inertiajs/core'
import { ComponentType, createElement, ReactNode, useEffect, useMemo, useState } from 'react'
import HeadContext from './HeadContext'
import PageContext from './PageContext'
import { AppComponent, AppOptions, RenderChildrenOptions } from './createInertiaApp'

type ReactPageHandlerOptions = {
  component: ReactNode
  page: AppOptions['initialPage']
  preserveState: boolean
}

type ReactPageHandler = (options: ReactPageHandlerOptions) => Promise<void>

type CurrentPage = {
  component: ReactNode
  page: AppOptions['initialPage']
  key: number | null
}

let currentIsInitialPage = true
let routerIsInitialized = false
let swapComponent: ReactPageHandler = async () => {
  // Dummy function so we can init the router outside of the useEffect hook. This is
  // needed so `router.reload()` works right away (on mount) in any of the user's
  // components. We swap in the real function in the useEffect hook below.
  currentIsInitialPage = false
}

function App<SharedProps extends PageProps = PageProps>({
  children,
  initialPage,
  initialComponent,
  resolveComponent,
  titleCallback,
  onHeadUpdate,
}: AppOptions<SharedProps>): ReturnType<AppComponent<SharedProps>> {
  const [current, setCurrent] = useState<CurrentPage>({
    component: initialComponent || null,
    page: initialPage,
    key: null,
  })

  const headManager = useMemo(() => {
    return createHeadManager(
      typeof window === 'undefined',
      titleCallback || ((title) => title),
      onHeadUpdate || (() => {}),
    )
  }, [])

  if (!routerIsInitialized) {
    router.init({
      initialPage,
      resolveComponent,
      swapComponent: (async (args: ReactPageHandlerOptions) => swapComponent(args)) as PageHandler,
    })

    routerIsInitialized = true
  }

  useEffect(() => {
    swapComponent = async ({ component, page, preserveState }) => {
      if (currentIsInitialPage) {
        // We block setting the current page on the initial page to
        // prevent the initial page from being re-rendered again.
        currentIsInitialPage = false
        return
      }

      setCurrent((current) => ({
        component,
        page,
        key: preserveState ? current.key : Date.now(),
      }))
    }

    router.on('navigate', () => headManager.forceUpdate())
  }, [])

  if (!current.component) {
    return createElement(
      HeadContext.Provider,
      { value: headManager },
      createElement(PageContext.Provider, { value: current.page }),
    )
  }

  const renderChildren =
    children ||
    (({ Component, props, key }: RenderChildrenOptions<SharedProps>) => {
      const child = createElement(Component, { key, ...props })

      if (typeof Component.layout === 'function') {
        return Component.layout(child)
      }

      if (Array.isArray(Component.layout)) {
        return [...Component.layout]
          .reverse()
          .reduce(
            (children: ReactNode, Layout: ComponentType): ReactNode => createElement(Layout, { children, ...props }),
            child,
          )
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
        Component: current.component as unknown as ComponentType,
        key: current.key,
        props: current.page.props as Page<SharedProps>['props'],
      }) as ReactNode,
    ),
  )
}

App.displayName = 'Inertia'

export default App
