import { mergeDataIntoQueryString, PageProps, Progress, router, shouldIntercept } from '@inertiajs/core'
import { createElement, forwardRef, useCallback } from 'react'

const noop = () => undefined

interface BaseInertiaLinkProps {
  as?: string
  data?: object
  href: string
  method?: string
  headers?: object
  onClick?: (event: React.MouseEvent<HTMLAnchorElement> | React.KeyboardEvent<HTMLAnchorElement>) => void
  preserveScroll?: boolean | ((props: PageProps) => boolean)
  preserveState?: boolean | ((props: PageProps) => boolean) | null
  replace?: boolean
  only?: string[]
  onCancelToken?: (cancelToken: import('axios').CancelTokenSource) => void
  onBefore?: () => void
  onStart?: () => void
  onProgress?: (progress: Progress) => void
  onFinish?: () => void
  onCancel?: () => void
  onSuccess?: () => void
  queryStringArrayFormat?: 'indices' | 'brackets'
}

type InertiaLinkProps = BaseInertiaLinkProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof BaseInertiaLinkProps> &
  Omit<React.AllHTMLAttributes<HTMLElement>, keyof BaseInertiaLinkProps>

export default forwardRef<unknown, InertiaLinkProps>(function Link(
  {
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
    queryStringArrayFormat = 'brackets',
    onClick = noop,
    onCancelToken = noop,
    onBefore = noop,
    onStart = noop,
    onProgress = noop,
    onFinish = noop,
    onCancel = noop,
    onSuccess = noop,
    onError = noop,
    ...props
  },
  ref,
) {
  const visit = useCallback(
    (event) => {
      onClick(event)

      if (shouldIntercept(event)) {
        event.preventDefault()

        router.visit(href, {
          // @ts-ignore
          data,
          // @ts-ignore
          method,
          // @ts-ignore
          preserveScroll,
          // @ts-ignore
          preserveState: preserveState ?? method !== 'get',
          replace,
          only,
          // @ts-ignore
          headers,
          // @ts-ignore
          onCancelToken,
          onBefore,
          onStart,
          onProgress,
          onFinish,
          onCancel,
          onSuccess,
          // @ts-ignore
          onError,
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
      onBefore,
      onStart,
      onProgress,
      onFinish,
      onCancel,
      onSuccess,
      onError,
    ],
  )

  as = as.toLowerCase()
  method = method.toLowerCase()
  // @ts-ignore
  const [_href, _data] = mergeDataIntoQueryString(method, href || '', data, queryStringArrayFormat)
  href = _href
  data = _data

  if (as === 'a' && method !== 'get') {
    console.warn(
      `Creating POST/PUT/PATCH/DELETE <a> links is discouraged as it causes "Open Link in New Tab/Window" accessibility issues.\n\nPlease specify a more appropriate element using the "as" attribute. For example:\n\n<Link href="${href}" method="${method}" as="button">...</Link>`,
    )
  }

  return createElement(
    as,
    {
      ...props,
      ...(as === 'a' ? { href } : {}),
      ref,
      onClick: visit,
    },
    children,
  )
})
