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
  const [page, setPage] = useState({
    component: null,
    key: null,
    props: {},
  })

  useEffect(() => {
    Inertia.init({
      initialPage,
      resolveComponent,
      updatePage: async (component, props, { preserveState }) => {
        setPage(page => ({
          component,
          key: preserveState ? page.key : Date.now(),
          props: transformProps(props),
        }))
      },
    })
  }, [initialPage, resolveComponent, transformProps])

  if (!page.component) {
    return createElement(PageContext.Provider, { value: page.props }, null)
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
    { value: page.props },
    renderChildren({ Component: page.component, key: page.key, props: page.props })
  )
}

App.displayName = 'Inertia'
