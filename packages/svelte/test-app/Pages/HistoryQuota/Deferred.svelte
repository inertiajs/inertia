<script lang="ts">
  import { Deferred } from '@inertiajs/svelte'

  let { largeData }: { largeData?: string } = $props()
</script>

<div>
  <h1>History Quota Test - Deferred</h1>

  <Deferred data="largeData">
    {#snippet fallback()}
      <p>Loading large data...</p>
    {/snippet}
    <p>Data size: {largeData?.length?.toLocaleString()} bytes</p>
  </Deferred>
</div>
