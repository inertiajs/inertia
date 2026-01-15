<script>
  import { WhenVisible } from '@inertiajs/svelte'

  export let lazyData

  let paramValue = 'initial'
</script>

<div>
  <button on:click={() => (paramValue = 'updated')}>Update Param</button>
  <p>Current param: {paramValue}</p>

  <div style="margin-top: 3000px">
    <WhenVisible data="lazyData" params={{ data: { paramValue } }} always>
      <div>
        <p>Data loaded: {lazyData?.text}</p>
      </div>
      <p slot="fallback">Loading lazy data...</p>
    </WhenVisible>
  </div>
</div>
