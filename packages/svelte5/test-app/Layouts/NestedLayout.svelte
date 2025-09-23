<script lang="ts">
  import { onMount } from 'svelte'
  import { page } from '@inertiajs/svelte'

  let createdAt: number | null = null

  onMount(() => {
    window._inertia_nested_layout_id = crypto.randomUUID()
    window._inertia_nested_layout_props = $page.props
    createdAt = Date.now()
  })
</script>

<div>
  <span>Nested Layout</span>
  <span>{createdAt}</span>
  <div>
    <slot />
  </div>
</div>
