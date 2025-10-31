<script lang="ts">
  import { isUrlMethodPair } from '@inertiajs/core'
  import type { LinkComponentBaseProps } from '@inertiajs/core'
  import { inertia } from '../index'

  export let href: LinkComponentBaseProps['href'] = ''
  export let as: keyof HTMLElementTagNameMap = 'a'
  export let data: LinkComponentBaseProps['data'] = {}
  export let method: LinkComponentBaseProps['method'] = 'get'
  export let replace: LinkComponentBaseProps['replace'] = false
  export let preserveScroll: LinkComponentBaseProps['preserveScroll'] = false
  export let preserveState: LinkComponentBaseProps['preserveState'] | null = null
  export let preserveUrl: LinkComponentBaseProps['preserveUrl'] = false
  export let only: LinkComponentBaseProps['only'] = []
  export let except: LinkComponentBaseProps['except'] = []
  export let headers: LinkComponentBaseProps['headers'] = {}
  export let queryStringArrayFormat: LinkComponentBaseProps['queryStringArrayFormat'] = 'brackets'
  export let async: LinkComponentBaseProps['async'] = false
  export let prefetch: LinkComponentBaseProps['prefetch'] = false
  export let cacheFor: LinkComponentBaseProps['cacheFor'] = 0
  export let cacheTags: LinkComponentBaseProps['cacheTags'] = []
  export let viewTransition: LinkComponentBaseProps['viewTransition'] = false

  $: _method = isUrlMethodPair(href) ? href.method : method
  $: _href = isUrlMethodPair(href) ? href.url : href

  $: asProp = _method !== 'get' ? 'button' : as.toLowerCase()
  $: elProps =
    {
      a: { href: _href },
      button: { type: 'button' },
    }[asProp] || {}
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
    preserveUrl,
    only,
    except,
    headers,
    queryStringArrayFormat,
    async,
    prefetch,
    cacheFor,
    cacheTags,
    viewTransition,
  }}
  {...$$restProps}
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
