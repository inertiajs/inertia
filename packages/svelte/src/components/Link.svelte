<script lang="ts">
  import type {
    CacheForOption,
    FormDataConvertible,
    LinkPrefetchOption,
    Method,
    PreserveStateOption,
  } from '@inertiajs/core'
  import { inertia } from '../index'

  export let href: string
  export let as: keyof HTMLElementTagNameMap = 'a'
  export let data: Record<string, FormDataConvertible> = {}
  export let method: Method = 'get'
  export let replace: boolean = false
  export let preserveScroll: PreserveStateOption = false
  export let preserveState: PreserveStateOption | null = null
  export let only: string[] = []
  export let except: string[] = []
  export let headers: Record<string, string> = {}
  export let queryStringArrayFormat: 'brackets' | 'indices' = 'brackets'
  export let async: boolean = false
  export let prefetch: boolean | LinkPrefetchOption | LinkPrefetchOption[] = false
  export let cacheFor: CacheForOption | CacheForOption[] = 0

  $: asProp = method !== 'get' ? 'button' : as.toLowerCase()
  $: elProps =
    {
      a: { href },
      button: { type: 'button' },
    }[asProp] || {}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<svelte:element
  this={asProp}
  use:inertia={{
    ...(as !== 'a' ? { href } : {}),
    data,
    method,
    replace,
    preserveScroll,
    preserveState: preserveState ?? method !== 'get',
    only,
    except,
    headers,
    queryStringArrayFormat,
    async,
    prefetch,
    cacheFor,
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
>
  <slot />
</svelte:element>
