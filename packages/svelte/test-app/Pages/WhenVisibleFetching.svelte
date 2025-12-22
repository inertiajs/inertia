<script>
  import { WhenVisible } from '@inertiajs/svelte'
</script>

<div style="margin-top: 5000px">
  <WhenVisible data="lazyData" always>
    {#snippet children({ fetching })}
      <div>Lazy data loaded!</div>
      {#if fetching}
        <div>Fetching in background...</div>
      {/if}
    {/snippet}
    {#snippet fallback()}
      <div>Loading lazy data...</div>
    {/snippet}
  </WhenVisible>
</div>
