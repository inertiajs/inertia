<script lang="ts">
  import { router, WhenVisible } from '@inertiajs/svelte'

  export let lazyData:
    | {
        text: string
      }
    | undefined = undefined

  const handleReload = () => {
    router.reload()
  }
</script>

<div>
  <h1>WhenVisible + Reload</h1>

  <button on:click={handleReload}>Reload Page</button>

  <div style="margin-top: 2000px; padding: 20px; border: 1px solid #ccc">
    <WhenVisible data="lazyData">
      <svelte:fragment slot="fallback">
        <p>Loading lazy data...</p>
      </svelte:fragment>

      {lazyData?.text}
    </WhenVisible>
  </div>
</div>
