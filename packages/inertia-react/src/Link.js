import { Inertia, shouldIntercept } from '@inertiajs/inertia'
import { createElement, useCallback, forwardRef } from 'react'

const noop = () => undefined

export default forwardRef(function InertiaLink({
  children,
  data = {},
  href,
  method = 'get',
  onClick = noop,
  preserveScroll = false,
  preserveState = false,
  replace = false,
  only = [],
  headers = {},
  onCancelToken = noop,
  onStart = noop,
  onProgress = noop,
  onFinish = noop,
  onCancel = noop,
  onSuccess = noop,
  ...props
}, ref) {
  const visit = useCallback(
    (event) => {
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
          headers,
          onCancelToken,
          onStart,
          onProgress,
          onFinish,
          onCancel,
          onSuccess,
        })
      }
    },
    [
      data,
      href,
      method,
      onClick,
      preserveScroll,
      preserveState,
      replace,
      only,
      headers,
      onClick,
      onCancelToken,
      onStart,
      onProgress,
      onFinish,
      onCancel,
      onSuccess,
    ]
  )

  return createElement('a', { ...props, href, ref, onClick: visit }, children)
})
