<script lang="ts">
  import { onMount } from 'svelte'
  import { page } from '@inertiajs/svelte'
  interface Props {
    children?: import('svelte').Snippet
  }

  let { children }: Props = $props()
  let createdAt = $state<number | null>(null)

  onMount(() => {
    window._inertia_nested_layout_id = crypto.randomUUID()
    createdAt = Date.now()
  })

  // Update props reactively when page changes
  $effect(() => {
    if (typeof window !== 'undefined') {
      window._inertia_nested_layout_props = page.props
    }
  })
</script>

<div>
  <span>Nested Layout</span>
  <span>{createdAt}</span>
  <div>
    {@render children?.()}
  </div>
</div>
