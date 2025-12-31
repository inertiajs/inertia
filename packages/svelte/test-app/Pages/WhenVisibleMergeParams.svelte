<script lang="ts">
  import { WhenVisible } from '@inertiajs/svelte'

  export let dataOnlyProp: { text: string } | undefined = undefined
  export let mergedProp: { text: string } | undefined = undefined
  export let mergedWithCallbackProp: { text: string } | undefined = undefined
</script>

<div id="data-only" style="margin-top: 3000px">
  <WhenVisible data="dataOnlyProp">
    <svelte:fragment slot="fallback">
      <div>Loading data only...</div>
    </svelte:fragment>
    <div>Data only loaded: {dataOnlyProp?.text}</div>
  </WhenVisible>
</div>

<div id="merged" style="margin-top: 5000px">
  <WhenVisible
    data="mergedProp"
    params={{
      data: { extra: 'from-params' },
    }}
  >
    <svelte:fragment slot="fallback">
      <div>Loading merged...</div>
    </svelte:fragment>
    <div>Merged loaded: {mergedProp?.text}</div>
  </WhenVisible>
</div>

<div id="merged-with-callback" style="margin-top: 5000px">
  <WhenVisible
    data="mergedWithCallbackProp"
    params={{
      data: { page: '2' },
      preserveUrl: true,
    }}
  >
    <svelte:fragment slot="fallback">
      <div>Loading merged with callback...</div>
    </svelte:fragment>
    <div>Merged with callback loaded: {mergedWithCallbackProp?.text}</div>
  </WhenVisible>
</div>
