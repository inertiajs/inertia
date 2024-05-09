<script context="module" lang="ts">
  import type { Snippet } from 'svelte'
  import type { Method, PreserveStateOption, RequestPayload } from '@inertiajs/core'

  type LinkProps = {
    href: string
    as: keyof HTMLElementTagNameMap
    data: RequestPayload
    method: Method
    replace: boolean
    preserveScroll: PreserveStateOption
    preserveState: PreserveStateOption | null
    only: string[]
    headers: Record<string, string>
    queryStringArrayFormat: 'brackets' | 'indices'
    children: Snippet
  }
</script>

<script lang="ts">
  import { default as inertia } from './link'

  let {
    href,
    as = 'a',
    data = {},
    method = 'get',
    replace = false,
    preserveScroll = false,
    preserveState = null,
    only = [],
    headers = {},
    queryStringArrayFormat = 'brackets',
    children,
    ...restProps
  }: LinkProps = $props()

  $effect.pre(() => {
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
    headers,
    queryStringArrayFormat,
  }}
  {...as === 'a' ? { href } : {}}
  {...restProps}
>
  {@render children()}
</svelte:element>
