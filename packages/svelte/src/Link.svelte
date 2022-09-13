<script>
  import { mergeDataIntoQueryString,router,shouldIntercept } from '@inertiajs/core'
  import { beforeUpdate,createEventDispatcher } from 'svelte'

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
    const [_href, _data] = mergeDataIntoQueryString(method, href, data)
    href = _href
    data = _data

    if (method !== 'get') {
      console.warn(`Creating POST/PUT/PATCH/DELETE <a> links is discouraged as it causes "Open Link in New Tab/Window" accessibility issues.\n\nPlease specify a more appropriate element using the "inertia" directive. For example:\n\n<button use:inertia={{ method: 'post', href: '${href}' }}>...</button>`)
    }
  })

  function visit(event) {
    dispatch('click', event)

    if (shouldIntercept(event)) {
      event.preventDefault()

      router.visit(href, {
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
