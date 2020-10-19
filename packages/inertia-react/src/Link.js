import { hrefToUrl, Inertia, mergeDataIntoQueryString, shouldIntercept } from '@inertiajs/inertia'
import { createElement, useCallback, forwardRef } from 'react'

const noop = () => undefined

export default forwardRef(function InertiaLink({
  children,
  as = 'a',
  data = {},
  href,
  method = 'get',
  preserveScroll = false,
  preserveState = null,
  replace = false,
  only = [],
  headers = {},
  onClick = noop,
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
          preserveState: preserveState ?? (method !== 'get'),
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
    ],
  )

  as = as.toLowerCase()
  method = method.toLowerCase()
  const [url, _data] = mergeDataIntoQueryString(method, hrefToUrl(href), data)
  href = url.href
  data = _data

  return createElement(as, {
    ...props,
    ...as === 'a' ? { href } : {},
    ref,
    onClick: visit,
  }, children)
})
