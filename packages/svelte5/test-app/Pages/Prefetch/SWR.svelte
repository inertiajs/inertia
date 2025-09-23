<script context="module" lang="ts">
  export { default as layout } from '@/Layouts/SWR.svelte'
</script>

<script lang="ts">
  export let pageNumber: number
  export let lastLoaded: number
</script>

<div>This is page {pageNumber}</div>
<div>
  Last loaded at <span id="last-loaded">{lastLoaded}</span>
</div>
