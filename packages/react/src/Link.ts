import {
  FormDataConvertible,
  mergeDataIntoQueryString,
  Method,
  PendingVisit,
  PreserveStateOption,
  Progress,
  router,
  shouldIntercept,
} from '@inertiajs/core'
import { createElement, forwardRef, useCallback, useState } from 'react'

const noop = () => undefined

interface BaseInertiaLinkProps {
  as?: string
  data?: Record<string, FormDataConvertible>
  href: string
  method?: Method
  headers?: Record<string, string>
  onClick?: (event: React.MouseEvent<Element>) => void
  preserveScroll?: PreserveStateOption
  preserveState?: PreserveStateOption
  replace?: boolean
  only?: string[]
  except?: string[]
  onCancelToken?: (cancelToken: import('axios').CancelTokenSource) => void
  onBefore?: () => void
  onStart?: (event: PendingVisit) => void
  onProgress?: (progress: Progress) => void
  onFinish?: (event: PendingVisit) => void
  onCancel?: () => void
  onSuccess?: () => void
  onError?: () => void
  queryStringArrayFormat?: 'indices' | 'brackets'
  async?: boolean
}

export type InertiaLinkProps = BaseInertiaLinkProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof BaseInertiaLinkProps> &
  Omit<React.AllHTMLAttributes<HTMLElement>, keyof BaseInertiaLinkProps>

const Link = forwardRef<unknown, InertiaLinkProps>(
  (
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
      except = [],
      headers = {},
      queryStringArrayFormat = 'brackets',
      async = false,
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
    const [inFlightCount, setInFlightCount] = useState(0)

    const visit = useCallback(
      (event: React.MouseEvent) => {
        onClick(event)

        if (shouldIntercept(event.nativeEvent)) {
          event.preventDefault()

          router.visit(href, {
            data,
            method,
            preserveScroll,
            preserveState: preserveState ?? method !== 'get',
            replace,
            only,
            except,
            headers,
            async,
            onCancelToken,
            onBefore,
            onStart(event) {
              setInFlightCount((count) => count + 1)
              onStart(event)
            },
            onProgress,
            onFinish(event) {
              setInFlightCount((count) => count - 1)
              onFinish(event)
            },
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
        except,
        headers,
        async,
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
    method = method.toLowerCase() as Method
    const [_href, _data] = mergeDataIntoQueryString(method, href || '', data, queryStringArrayFormat)
    href = _href
    data = _data

    if (method !== 'get') {
      as = 'button'
    }

    const elProps = {
      a: { href },
      button: { type: 'button' },
    }

    return createElement(
      as,
      {
        ...props,
        ...(elProps[as] || {}),
        ref,
        onClick: visit,
        'data-loading': inFlightCount > 0 ? '' : undefined,
      },
      children,
    )
  },
)
Link.displayName = 'InertiaLink'

export default Link
