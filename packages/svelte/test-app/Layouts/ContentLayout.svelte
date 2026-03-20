<script lang="ts">
  import { onMount } from 'svelte'

  interface Props {
    padding?: string
    maxWidth?: string
    children?: import('svelte').Snippet
  }

  let { padding = 'md', maxWidth = 'lg', children }: Props = $props()

  onMount(() => {
    window._inertia_content_layout_id = crypto.randomUUID()
  })
</script>

<div class="content-layout" data-padding={padding} data-max-width={maxWidth}>
  <div class="content-wrapper">
    {@render children?.()}
  </div>
</div>
