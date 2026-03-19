<script lang="ts">
  import type { Snippet } from 'svelte'

  let { title = 'Default Title', children }: { title?: string; children: Snippet } = $props()
</script>

<div class="ssr-layout">
  <h1 data-testid="layout-title">{title}</h1>
  {@render children()}
</div>
