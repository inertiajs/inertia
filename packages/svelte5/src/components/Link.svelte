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
  on:focus
  on:blur
  on:click
  on:dblclick
  on:mousedown
  on:mousemove
  on:mouseout
  on:mouseover
  on:mouseup
  on:cancel-token
  on:before
  on:start
  on:progress
  on:finish
  on:cancel
  on:success
  on:error
  on:prefetching
  on:prefetched
>
  <slot />
</svelte:element>
