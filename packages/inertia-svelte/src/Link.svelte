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
    preserveState = false,
    only = []

  $: props = (({ data, href, method, preserveScroll, preserveState, replace, only, ...rest }) => rest)($$props)

  function visit(event) {
    dispatch('click', event)

    if (shouldIntercept(event)) {
      event.preventDefault()

      Inertia.visit(href, {
        data,
        method,
        preserveScroll,
        preserveState,
        replace,
        only,
      })
    }
  }
</script>

<a {...props} href={href} on:click={visit}>
  <slot />
</a>
