<script>
  import inertia from './link'

  export let
    data = {},
    href,
    method = 'get',
    replace = false,
    preserveScroll = false,
    preserveState = false,
    only = [],
    headers = {}
</script>

<a
  use:inertia={{ ...$$props }}
  {...$$restProps}
  {href}
  on:click
  on:cancelToken
  on:start
  on:progress
  on:finish
  on:cancel
  on:success>
  <slot />
</a>
