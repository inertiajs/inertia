<script lang="ts">
  import { WhenVisible } from '@inertiajs/svelte'

  interface Props {
    count?: number
  }

  let { count = $bindable(0) }: Props = $props()
</script>

<div style="margin-top: 5000px">
  <WhenVisible data="foo">
    {#snippet fallback()}
      <div>Loading first one...</div>
    {/snippet}

    <div>First one is visible!</div>
  </WhenVisible>
</div>

<div style="margin-top: 5000px">
  <WhenVisible buffer={1000} data="foo">
    {#snippet fallback()}
      <div>Loading second one...</div>
    {/snippet}

    <div>Second one is visible!</div>
  </WhenVisible>
</div>

<div style="margin-top: 5000px">
  <WhenVisible data="foo" always>
    {#snippet fallback()}
      <div>Loading third one...</div>
    {/snippet}

    <div>Third one is visible!</div>
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

    <div>Count is now {count}</div>
  </WhenVisible>
</div>
