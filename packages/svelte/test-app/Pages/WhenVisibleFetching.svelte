<script>
  import { WhenVisible } from '@inertiajs/svelte'
</script>

<div style="margin-top: 5000px">
  <WhenVisible data="lazyData" always let:fetching>
    <div>Lazy data loaded!</div>
    {#if fetching}
      <div>Fetching in background...</div>
    {/if}

    <svelte:fragment slot="fallback">
      <div>Loading lazy data...</div>
    </svelte:fragment>
  </WhenVisible>
</div>
