<script module lang="ts">
  export { default as layout } from '@/Layouts/SWR.svelte'
</script>

<script lang="ts">
  interface Props {
    pageNumber: number
    lastLoaded: number
  }

  let { pageNumber, lastLoaded }: Props = $props()
</script>

<div>This is page {pageNumber}</div>
<div>
  Last loaded at <span id="last-loaded">{lastLoaded}</span>
</div>
