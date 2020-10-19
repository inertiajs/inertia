<script>
  import { hrefToUrl, Inertia, mergeDataIntoQueryString, shouldIntercept } from '@inertiajs/inertia'
  import { beforeUpdate, createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  export let
    data = {},
    href,
    method = 'get',
    replace = false,
    preserveScroll = false,
    preserveState = null,
    only = [],
    headers = {}

  beforeUpdate(() => {
    method = method.toLowerCase()
    const [url, _data] = mergeDataIntoQueryString(method, hrefToUrl(href), data)
    href = url.href
    data = _data
  })

  function visit(event) {
    dispatch('click', event)

    if (shouldIntercept(event)) {
      event.preventDefault()

      Inertia.visit(href, {
        data,
        method,
        preserveScroll,
        preserveState: preserveState !== null ? preserveState : (method !== 'get'),
        replace,
        only,
        headers,
      })
    }
  }
</script>

<a {...$$restProps} {href} on:click={visit}>
  <slot />
</a>
