import {
  createHeadManager,
  HeadManagerOnUpdateCallback,
  HeadManagerTitleCallback,
  Page,
  PageHandler,
  PageProps,
  router,
} from '@inertiajs/core'
import { createElement, ReactNode, useEffect, useMemo, useState } from 'react'
import HeadContext from './HeadContext'
import PageContext from './PageContext'
import { ReactPageHandlerArgs } from './types'

let currentIsInitialPage = true
let routerIsInitialized = false
let swapComponent: PageHandler<ReactNode> = async () => {
  // Dummy function so we can init the router outside of the useEffect hook. This is
  // needed so `router.reload()` works right away (on mount) in any of the user's
  // components. We swap in the real function in the useEffect hook below.
  currentIsInitialPage = false
}

type CurrentPage = {
  component: ReactNode | null
  page: Page
  key: number | null
}

export interface InertiaAppProps<SharedProps extends PageProps = PageProps> {
  children?: (options: { component: ReactNode; props: PageProps; key: number | null }) => ReactNode
  initialPage: Page<SharedProps>
  initialComponent?: ReactNode
  resolveComponent?: (name: string) => ReactNode | Promise<ReactNode>
  titleCallback?: HeadManagerTitleCallback
  onHeadUpdate?: HeadManagerOnUpdateCallback
}

export default function App<SharedProps extends PageProps = PageProps>({
  children,
  initialPage,
  initialComponent,
  resolveComponent,
  titleCallback,
  onHeadUpdate,
}: InertiaAppProps<SharedProps>) {
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
    router.init<ReactNode>({
      initialPage,
      resolveComponent: resolveComponent!,
      swapComponent: async (args) => swapComponent(args),
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
      createElement(PageContext.Provider, { value: current.page }, null),
    )
  }

  const renderChildren =
    children ||
    (({ component, props, key }) => {
      const child = createElement(component, { key, ...props })

      if (typeof component.layout === 'function') {
        return component.layout(child)
      }

      if (Array.isArray(component.layout)) {
        return component.layout
          .concat(child)
          .reverse()
          .reduce((children, Layout) => createElement(Layout, { children, ...props }))
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
        component: current.component,
        key: current.key,
        props: current.page.props,
      }),
    ),
  )
}

App.displayName = 'Inertia'
