<script lang="ts">
  import type {
    CacheForOption,
    FormDataConvertible,
    LinkPrefetchOption,
    Method,
    PreserveStateOption,
  } from '@inertiajs/core'
  import { inertia } from '../index'
  import type { SvelteComponent } from 'svelte'

  export let href: string | { url: string; method: Method } = ''
  export let as: keyof HTMLElementTagNameMap | typeof SvelteComponent = 'a'
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

  $: _method = typeof href === 'object' ? href.method : method
  $: _href = typeof href === 'object' ? href.url : href

  // For custom components, we always use a button wrapper
  $: elementType = typeof as !== 'string' ? 'button' : (_method !== 'get' ? 'button' : as.toLowerCase())
  $: elProps = elementType === 'button' ? { type: 'button' } :
               elementType === 'a' ? { href: _href } : {}

  $: inertiaConfig = {
    ...(elementType !== 'a' ? { href: _href } : {}),
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
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<svelte:element
  this={elementType}
  use:inertia={inertiaConfig}
  {...$$restProps}
  {...elProps}
  {...(typeof as !== 'string' ? { style: 'background: none; border: none; padding: 0; font: inherit; cursor: pointer; outline: inherit; display: inline-block;' } : {})}
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
  {#if typeof as === 'string'}
    <slot />
  {:else}
    <svelte:component this={as}>
      <slot />
    </svelte:component>
  {/if}
</svelte:element>
