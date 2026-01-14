<script lang="ts">
  import { router, WhenVisible } from '@inertiajs/svelte'

  export let firstData:
    | {
        text: string
      }
    | undefined = undefined

  export let secondData:
    | {
        text: string
      }
    | undefined = undefined

  const handleReload = () => {
    router.reload()
  }
</script>

<div>
  <h1>WhenVisible + Array Props + Reload</h1>

  <button on:click={handleReload}>Reload Page</button>

  <div style="margin-top: 2000px; padding: 20px; border: 1px solid #ccc">
    <WhenVisible data={['firstData', 'secondData']}>
      <svelte:fragment slot="fallback">
        <p>Loading array data...</p>
      </svelte:fragment>

      <div>
        <p>{firstData?.text}</p>
        <p>{secondData?.text}</p>
      </div>
    </WhenVisible>
  </div>
</div>
