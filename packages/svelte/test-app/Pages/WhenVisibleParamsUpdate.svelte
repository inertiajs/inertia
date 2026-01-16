<script>
  import { WhenVisible } from '@inertiajs/svelte'

  let { lazyData } = $props()

  let paramValue = $state('initial')
</script>

<div>
  <button onclick={() => (paramValue = 'updated')}>Update Param</button>
  <p>Current param: {paramValue}</p>

  <div style="margin-top: 3000px">
    <WhenVisible data="lazyData" params={{ data: { paramValue } }} always>
      <div>
        <p>Data loaded: {lazyData?.text}</p>
      </div>
      {#snippet fallback()}
        <p>Loading lazy data...</p>
      {/snippet}
    </WhenVisible>
  </div>
</div>
