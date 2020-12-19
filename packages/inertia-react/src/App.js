import { Inertia } from '@inertiajs/inertia'
import { createElement, useEffect, useState } from 'react'
import PageContext from './PageContext'

const identity = i => i

export default function App({
  children,
  initialPage,
  resolveComponent,
  transformProps = identity,
}) {
  const [current, setCurrent] = useState({
    component: null,
    page: {},
    key: null,
  })

  useEffect(() => {
    Inertia.init({
      initialPage,
      resolveComponent,
      transformProps,
      swapComponent: async ({ component, page, preserveState }) => {
        setCurrent(current => ({
          component,
          page,
          key: preserveState ? current.key : Date.now(),
        }))
      },
    })
  }, [initialPage, resolveComponent, transformProps])

  if (!current.component) {
    return createElement(PageContext.Provider, { value: current.page }, null)
  }

  const renderChildren = children || (({ Component, props, key }) => {
    const child = createElement(Component, { key, ...props })

    if (typeof Component.layout === 'function') {
      return Component.layout(child)
    }

    if (Array.isArray(Component.layout)) {
      return Component.layout
        .concat(child)
        .reverse()
        .reduce((children, Layout) => createElement(Layout, { children }))
    }

    return child
  })

  return createElement(
    PageContext.Provider,
    { value: current.page },
    renderChildren({ Component: current.component, key: current.key, props: current.page.props }),
  )
}

App.displayName = 'Inertia'
