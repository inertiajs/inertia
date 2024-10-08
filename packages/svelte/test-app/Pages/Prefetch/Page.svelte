<script context="module">
  export { default as layout } from '@/Layouts/Prefetch.svelte'
</script>

<script>
  export let pageNumber
  export let lastLoaded
</script>

<div>This is page {pageNumber}</div>
<div>
  Last loaded at <span id="last-loaded">{lastLoaded}</span>
</div>
