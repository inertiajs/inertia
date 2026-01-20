<script lang="ts">
  import { onMount } from 'svelte'
  import { page } from '@inertiajs/svelte'
  interface Props {
    children?: import('svelte').Snippet
  }

  let { children }: Props = $props()

  let createdAt: number | null = $state(null)

  onMount(() => {
    window._inertia_layout_id = crypto.randomUUID()
    window._inertia_site_layout_props = page.props
    createdAt = Date.now()
  })
</script>

<div>
  <span>Site Layout</span>
  <span>{createdAt}</span>
  <div>
    {@render children?.()}
  </div>
</div>
