<script lang="ts">
  import { onMount } from 'svelte'
  import { page } from '@inertiajs/svelte5'

  const { children } = $props()
  let createdAt = $state<number | null>(null)

  onMount(() => {
    window._inertia_layout_id = crypto.randomUUID()
    createdAt = Date.now()
  })

  // Update props reactively when page changes
  $effect(() => {
    if (typeof window !== 'undefined') {
      window._inertia_site_layout_props = $page.props
    }
  })
</script>

<div>
  <span>Site Layout</span>
  <span>{createdAt}</span>
  <div>
    {@render children?.()}
  </div>
</div>
