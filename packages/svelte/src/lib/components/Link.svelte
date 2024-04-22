<script lang="ts">
  import type { Method, PreserveStateOption, RequestPayload } from '@inertiajs/core'
  import { beforeUpdate } from 'svelte'
  import { inertia } from '../index'

  export let href: string
  export let as: keyof HTMLElementTagNameMap = 'a'
  export let data: RequestPayload = {}
  export let method: Method = 'get'
  export let replace: boolean = false
  export let preserveScroll: PreserveStateOption = false
  export let preserveState: PreserveStateOption | null = null
  export let only: string[] = []
  export let except: string[] = []
  export let headers: Record<string, string> = {}
  export let queryStringArrayFormat: 'brackets' | 'indices' = 'brackets'

  beforeUpdate(() => {
    if (as === 'a' && method.toLowerCase() !== 'get') {
      console.warn(
        `Creating POST/PUT/PATCH/DELETE <a> links is discouraged as it causes "Open Link in New Tab/Window" accessibility issues.\n\nPlease specify a more appropriate element using the "as" attribute. For example:\n\n<Link href="${href}" method="${method}" as="button">...</Link>`,
      )
    }
  })
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<svelte:element
  this={as}
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
  }}
  {...as === 'a' ? { href } : {}}
  {...$$restProps}
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
