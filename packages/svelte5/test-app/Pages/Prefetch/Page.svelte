<script context="module" lang="ts">
  export { default as layout } from '@/Layouts/Prefetch.svelte'
</script>

<script lang="ts">
  const { pageNumber, lastLoaded }: { pageNumber: number; lastLoaded: number } = $props()
</script>

<div>This is page {pageNumber}</div>
<div>
  Last loaded at <span id="last-loaded">{lastLoaded}</span>
</div>
