<script>
  import { onMount } from 'svelte'
  import { page } from '@inertiajs/svelte'

  let createdAt = null

  onMount(() => {
    window._inertia_layout_id = crypto.randomUUID()
    window._inertia_site_layout_props = $page.props
    createdAt = Date.now()
  })
</script>

<div>
  <span>Site Layout</span>
  <span>{createdAt}</span>
  <div>
    <slot />
  </div>
</div>
