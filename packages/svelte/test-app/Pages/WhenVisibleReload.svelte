<script lang="ts">
  import { router, WhenVisible } from '@inertiajs/svelte'

  interface Props {
    lazyData?:
      | {
          text: string
        }
      | undefined
  }

  let { lazyData = undefined }: Props = $props()

  const handleReload = () => {
    router.reload()
  }
</script>

<div>
  <h1>WhenVisible + Reload</h1>

  <button onclick={handleReload}>Reload Page</button>

  <div style="margin-top: 2000px; padding: 20px; border: 1px solid #ccc">
    <WhenVisible data="lazyData">
      {#snippet fallback()}
        <p>Loading lazy data...</p>
      {/snippet}

      {lazyData?.text}
    </WhenVisible>
  </div>
</div>
