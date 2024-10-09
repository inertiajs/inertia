<script>
  import { WhenVisible } from '@inertiajs/svelte'
</script>

<div style="margin-top: 5000px">
  <WhenVisible data="foo">
    <svelte:fragment slot="fallback">
      <div>Loading first one...</div>
    </svelte:fragment>

    <div>First one is visible!</div>
  </WhenVisible>
</div>

<div style="margin-top: 5000px">
  <WhenVisible buffer={1000} data="foo">
    <svelte:fragment slot="fallback">
      <div>Loading second one...</div>
    </svelte:fragment>

    <div>Second one is visible!</div>
  </WhenVisible>
</div>

<div style="margin-top: 5000px">
  <WhenVisible data="foo" always>
    <svelte:fragment slot="fallback">
      <div>Loading third one...</div>
    </svelte:fragment>

    <div>Third one is visible!</div>
  </WhenVisible>
</div>
