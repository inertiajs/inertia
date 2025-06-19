import { createHeadManager, router } from '@inertiajs/core'
import { createElement, useEffect, useMemo, useRef, useState } from 'react'
import HeadContext from './HeadContext'
import PageContext from './PageContext'

export default function App({
  children,
  initialPage,
  initialComponent,
  resolveComponent,
  titleCallback,
  onHeadUpdate,
}) {
  const [current, setCurrent] = useState({
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

  const currentIsInitialPage = useRef(true)
  const routerIsInitialized = useRef(false)

  const swapComponentRef = useRef(async (params) => {
    // Dummy function so that we can initialize the router outside of the
    // useEffect hook, so that router.reload() can be called on mount.
    // We set the real swapComponent function in the useEffect below.
  })

  if (!routerIsInitialized.current) {
    router.init({
      initialPage,
      resolveComponent,
      swapComponent: (params) => swapComponentRef.current(params),
    })

    routerIsInitialized.current = true
  }

  useEffect(() => {
    swapComponentRef.current = async ({ component, page, preserveState }) => {
      if (currentIsInitialPage.current) {
        currentIsInitialPage.current = false
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
    (({ Component, props, key }) => {
      const child = createElement(Component, { key, ...props })

      if (typeof Component.layout === 'function') {
        return Component.layout(child)
      }

      if (Array.isArray(Component.layout)) {
        return Component.layout
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
        Component: current.component,
        key: current.key,
        props: current.page.props,
      }),
    ),
  )
}

App.displayName = 'Inertia'
