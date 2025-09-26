<script lang="ts">
  import { WhenVisible } from '@inertiajs/svelte5'

  let { count: initialCount = 0 } = $props()
  let count = $state(initialCount)
</script>

<div style="margin-top: 5000px">
  <WhenVisible data="foo">
    {#snippet fallback()}
      <div>Loading first one...</div>
    {/snippet}
    {#snippet children()}
      <div>First one is visible!</div>
    {/snippet}
  </WhenVisible>
</div>

<div style="margin-top: 5000px">
  <WhenVisible buffer={1000} data="foo">
    {#snippet fallback()}
      <div>Loading second one...</div>
    {/snippet}
    {#snippet children()}
      <div>Second one is visible!</div>
    {/snippet}
  </WhenVisible>
</div>

<div style="margin-top: 5000px">
  <WhenVisible data="foo" always>
    {#snippet fallback()}
      <div>Loading third one...</div>
    {/snippet}
    {#snippet children()}
      <div>Third one is visible!</div>
    {/snippet}
  </WhenVisible>
</div>

<div style="margin-top: 5000px">
  <WhenVisible data="foo">
    {#snippet fallback()}
      <div>Loading fourth one...</div>
    {/snippet}
  </WhenVisible>
</div>

<div style="margin-top: 6000px">
  <WhenVisible
    always
    params={{
      data: {
        count,
      },
      onSuccess() {
        count += 1
      },
    }}
  >
    {#snippet fallback()}
      <div>Loading fifth one...</div>
    {/snippet}
    {#snippet children()}
      <div>Count is now {count}</div>
    {/snippet}
  </WhenVisible>
</div>
