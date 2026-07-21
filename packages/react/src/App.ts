import {
  createHeadManager,
  HeadManagerOnUpdateCallback,
  HeadManagerTitleCallback,
  Page,
  PageHandler,
  PageProps,
  router,
} from '@inertiajs/core'
import { createElement, FunctionComponent, ReactNode, useEffect, useMemo, useState } from 'react'
import { flushSync } from 'react-dom'
import HeadContext from './HeadContext'
import PageContext from './PageContext'
import { LayoutFunction, ReactComponent, ReactPageHandlerArgs } from './types'

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
  key: number | null
}

export interface InertiaAppProps<SharedProps extends PageProps = PageProps> {
  children?: (options: { Component: ReactComponent; props: PageProps; key: number | null }) => ReactNode
  initialPage: Page<SharedProps>
  initialComponent?: ReactComponent
  resolveComponent?: (name: string) => ReactComponent | Promise<ReactComponent>
  titleCallback?: HeadManagerTitleCallback
  onHeadUpdate?: HeadManagerOnUpdateCallback
}

export type InertiaApp = FunctionComponent<InertiaAppProps>

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
    swapComponent = async ({ component, page, preserveState, initialRender }: ReactPageHandlerArgs) => {
      if (initialRender) {
        // We block setting the current page on the initial page to
        // prevent the initial page from being re-rendered again.
        return
      }

      flushSync(() =>
        setCurrent((current) => ({
          component,
          page,
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

      if (typeof Component.layout === 'function') {
        return (Component.layout as LayoutFunction)(child)
      }

      if (Array.isArray(Component.layout)) {
        return (Component.layout as any)
          .concat(child)
          .reverse()
          .reduce((children: any, Layout: any) => createElement(Layout, { children, ...props }))
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
