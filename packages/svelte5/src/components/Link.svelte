<script lang="ts">
  import { isUrlMethodPair } from '@inertiajs/core'
  import type {
    CacheForOption,
    FormDataConvertible,
    LinkPrefetchOption,
    Method,
    PreserveStateOption,
    UrlMethodPair,
  } from '@inertiajs/core'
  import { inertia } from '../index'

  const {
    href = '',
    as = 'a',
    data = {},
    method = 'get',
    replace = false,
    preserveScroll = false,
    preserveState = null,
    only = [],
    except = [],
    headers = {},
    queryStringArrayFormat = 'brackets',
    async = false,
    prefetch = false,
    cacheFor = 0,
    cacheTags = [],
    children,
    // Extract event handlers with new Svelte 5 syntax
    onfocus,
    onblur,
    onclick,
    ondblclick,
    onmousedown,
    onmousemove,
    onmouseout,
    onmouseover,
    onmouseup,
    onbefore,
    onstart,
    onprogress,
    onfinish,
    oncancel,
    onsuccess,
    onerror,
    onprefetching,
    onprefetched,
    'oncancel-token': oncanceltoken,
    ...restProps
  }: {
    href?: string | UrlMethodPair
    as?: keyof HTMLElementTagNameMap
    data?: Record<string, FormDataConvertible>
    method?: Method
    replace?: boolean
    preserveScroll?: PreserveStateOption
    preserveState?: PreserveStateOption | null
    only?: string[]
    except?: string[]
    headers?: Record<string, string>
    queryStringArrayFormat?: 'brackets' | 'indices'
    async?: boolean
    prefetch?: boolean | LinkPrefetchOption | LinkPrefetchOption[]
    cacheFor?: CacheForOption | CacheForOption[]
    cacheTags?: string | string[]
    children?: any
    // Event handler types
    onfocus?: (event: FocusEvent) => void
    onblur?: (event: FocusEvent) => void
    onclick?: (event: MouseEvent) => void
    ondblclick?: (event: MouseEvent) => void
    onmousedown?: (event: MouseEvent) => void
    onmousemove?: (event: MouseEvent) => void
    onmouseout?: (event: MouseEvent) => void
    onmouseover?: (event: MouseEvent) => void
    onmouseup?: (event: MouseEvent) => void
    onbefore?: (event: any) => void
    onstart?: (event: any) => void
    onprogress?: (event: any) => void
    onfinish?: (event: any) => void
    oncancel?: (event: any) => void
    onsuccess?: (event: any) => void
    onerror?: (event: any) => void
    onprefetching?: (event: any) => void
    onprefetched?: (event: any) => void
    'oncancel-token'?: (event: any) => void
    [key: string]: any
  } = $props()

  const _method = $derived(isUrlMethodPair(href) ? href.method : method)
  const _href = $derived(isUrlMethodPair(href) ? href.url : href)

  const asProp = $derived(_method !== 'get' ? 'button' : as.toLowerCase())
  const elProps = $derived(
    {
      a: { href: _href },
      button: { type: 'button' },
    }[asProp] || {}
  )
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<svelte:element
  this={asProp}
  use:inertia={{
    ...(asProp !== 'a' ? { href: _href } : {}),
    data,
    method: _method,
    replace,
    preserveScroll,
    preserveState: preserveState ?? _method !== 'get',
    only,
    except,
    headers,
    queryStringArrayFormat,
    async,
    prefetch,
    cacheFor,
    cacheTags,
  }}
  {...restProps}
  {...elProps}
  {onfocus}
  {onblur}
  {onclick}
  {ondblclick}
  {onmousedown}
  {onmousemove}
  {onmouseout}
  {onmouseover}
  {onmouseup}
  oncancel-token={oncanceltoken}
  {onbefore}
  {onstart}
  {onprogress}
  {onfinish}
  {oncancel}
  {onsuccess}
  {onerror}
  {onprefetching}
  {onprefetched}
>
  {@render children?.()}
</svelte:element>
