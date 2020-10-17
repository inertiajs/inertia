<script>
  import { Inertia, shouldIntercept } from '@inertiajs/inertia'
  import { createEventDispatcher } from 'svelte'

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
        headers
      })
    }
  }
</script>

<a {...$$restProps} {href} on:click={visit}>
  <slot />
</a>
