<script lang="ts">
  import { Link, WhenVisible } from '@inertiajs/svelte'

  export let lazyData:
    | {
        text: string
      }
    | undefined = undefined
</script>

<div>
  <h1>WhenVisible + Back Button</h1>

  <Link href="/links/method">Navigate Away</Link>

  <div style="margin-top: 2000px; padding: 20px; border: 1px solid #ccc">
    <WhenVisible data="lazyData">
      <svelte:fragment slot="fallback">
        <p>Loading lazy data...</p>
      </svelte:fragment>

      <p>{lazyData?.text}</p>
    </WhenVisible>
  </div>

  <div style="margin-top: 2000px; padding: 20px; border: 1px solid #ccc">
    <WhenVisible data="lazyData" always>
      <svelte:fragment slot="fallback">
        <p>Loading always data...</p>
      </svelte:fragment>

      <p>Always: {lazyData?.text}</p>
    </WhenVisible>
  </div>
</div>
