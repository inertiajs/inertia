import {
  FormDataConvertible,
  mergeDataIntoQueryString,
  Method,
  PreserveStateOption,
  Progress,
  router,
  shouldIntercept,
} from '@inertiajs/core'
import { createElement, forwardRef, useCallback, ComponentType } from 'react'

const noop = () => undefined

interface BaseInertiaLinkProps {
  as?: string | ComponentType,
  data?: Record<string, FormDataConvertible>
  href: string
  method?: Method
  headers?: Record<string, string>
  onClick?: (event: React.MouseEvent<HTMLAnchorElement> | React.KeyboardEvent<HTMLAnchorElement>) => void
  preserveScroll?: PreserveStateOption
  preserveState?: PreserveStateOption
  replace?: boolean
  only?: string[]
  onCancelToken?: (cancelToken: import('axios').CancelTokenSource) => void
  onBefore?: () => void
  onStart?: () => void
  onProgress?: (progress: Progress) => void
  onFinish?: () => void
  onCancel?: () => void
  onSuccess?: () => void
  onError?: () => void
  queryStringArrayFormat?: 'indices' | 'brackets'
}

type InertiaLinkProps = BaseInertiaLinkProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof BaseInertiaLinkProps> &
  Omit<React.AllHTMLAttributes<HTMLElement>, keyof BaseInertiaLinkProps>

type InertiaLink = React.FunctionComponent<InertiaLinkProps>

const Link: InertiaLink = forwardRef<unknown, InertiaLinkProps>(
  (
    {
      children,
      as: Element = 'a',
      data = {},
      href,
      method = Method.GET,
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
  ) => {
    const visit = useCallback(
      (event) => {
        onClick(event)

        if (shouldIntercept(event)) {
          event.preventDefault()

          router.visit(href, {
            data,
            method,
            preserveScroll,
            preserveState: preserveState ?? method !== 'get',
            replace,
            only,
            headers,
            onCancelToken,
            onBefore,
            onStart,
            onProgress,
            onFinish,
            onCancel,
            onSuccess,
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

    method = method.toLowerCase() as Method
    const [_href, _data] = mergeDataIntoQueryString(method, href || '', data, queryStringArrayFormat)
    href = _href
    data = _data
  
    if (typeof as === 'string') {
      Element = Element.toLowerCase()

      if (Element === 'a' && method !== 'get') {
        console.warn(
          `Creating POST/PUT/PATCH/DELETE <a> links is discouraged as it causes "Open Link in New Tab/Window" accessibility issues.\n\nPlease specify a more appropriate element using the "as" attribute. For example:\n\n<Link href="${href}" method="${method}" as="button">...</Link>`,
        )
      }
    }

    return (
      <Element
        {...props}
        href={Element === 'a' ? href : undefined}
        ref={ref}
        onClick={visit}
      >
        {children}
      </Element>
    )
  },
)

export default Link
