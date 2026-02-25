<script lang="ts">
  import { Deferred } from '@inertiajs/svelte'

  let { title, heavyData }: { title?: string; heavyData?: string } = $props()
</script>

<div>
  <div id="deferred">This is Deferred</div>
  <div id="title">Title: {title ?? 'none'}</div>

  <Deferred data="heavyData">
    {#snippet fallback()}
      <div id="heavy-loading">Loading heavy data...</div>
    {/snippet}

    <div id="heavy-data">Heavy: {heavyData}</div>
  </Deferred>
</div>
