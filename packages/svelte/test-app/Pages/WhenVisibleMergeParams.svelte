<script lang="ts">
  import { WhenVisible } from '@inertiajs/svelte'

  interface Props {
    dataOnlyProp?: { text: string } | undefined
    mergedProp?: { text: string } | undefined
    mergedWithCallbackProp?: { text: string } | undefined
  }

  let { dataOnlyProp = undefined, mergedProp = undefined, mergedWithCallbackProp = undefined }: Props = $props()
</script>

<div id="data-only" style="margin-top: 3000px">
  <WhenVisible data="dataOnlyProp">
    {#snippet fallback()}
      <div>Loading data only...</div>
    {/snippet}
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
    {#snippet fallback()}
      <div>Loading merged...</div>
    {/snippet}
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
    {#snippet fallback()}
      <div>Loading merged with callback...</div>
    {/snippet}
    <div>Merged with callback loaded: {mergedWithCallbackProp?.text}</div>
  </WhenVisible>
</div>
