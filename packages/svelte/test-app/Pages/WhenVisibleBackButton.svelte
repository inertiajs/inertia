<script lang="ts">
  import { Link, WhenVisible } from '@inertiajs/svelte'

  interface Props {
    lazyData?:
      | {
          text: string
        }
      | undefined
  }

  let { lazyData = undefined }: Props = $props()
</script>

<div>
  <h1>WhenVisible + Back Button</h1>

  <Link href="/links/method">Navigate Away</Link>

  <div style="margin-top: 2000px; padding: 20px; border: 1px solid #ccc">
    <WhenVisible data="lazyData">
      {#snippet fallback()}
        <p>Loading lazy data...</p>
      {/snippet}

      <p>{lazyData?.text}</p>
    </WhenVisible>
  </div>

  <div style="margin-top: 2000px; padding: 20px; border: 1px solid #ccc">
    <WhenVisible data="lazyData" always>
      {#snippet fallback()}
        <p>Loading always data...</p>
      {/snippet}

      <p>Always: {lazyData?.text}</p>
    </WhenVisible>
  </div>
</div>
