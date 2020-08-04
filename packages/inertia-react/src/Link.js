import { Inertia, shouldIntercept } from '@inertiajs/inertia'
import { createElement, useCallback } from 'react'

const noop = () => undefined

export default function InertiaLink({
  children,
  data = {},
  href,
  method = 'get',
  onClick = noop,
  preserveScroll = false,
  preserveState = false,
  replace = false,
  only = [],
  ...props
}) {
  const visit = useCallback(event => {
    onClick(event)

    if (shouldIntercept(event)) {
      event.preventDefault()

      Inertia.visit(href, {
        data,
        method,
        preserveScroll,
        preserveState,
        replace,
        only,
      })
    }
  }, [data, href, method, onClick, preserveScroll, preserveState, replace, only])

  return createElement('a', { ...props, href, onClick: visit }, children)
}
