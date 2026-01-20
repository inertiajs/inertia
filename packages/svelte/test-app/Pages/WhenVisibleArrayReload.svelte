<script lang="ts">
  import { router, WhenVisible } from '@inertiajs/svelte'

  interface Props {
    firstData?:
      | {
          text: string
        }
      | undefined
    secondData?:
      | {
          text: string
        }
      | undefined
  }

  let { firstData = undefined, secondData = undefined }: Props = $props()

  const handleReload = () => {
    router.reload()
  }
</script>

<div>
  <h1>WhenVisible + Array Props + Reload</h1>

  <button onclick={handleReload}>Reload Page</button>

  <div style="margin-top: 2000px; padding: 20px; border: 1px solid #ccc">
    <WhenVisible data={['firstData', 'secondData']}>
      {#snippet fallback()}
        <p>Loading array data...</p>
      {/snippet}

      <div>
        <p>{firstData?.text}</p>
        <p>{secondData?.text}</p>
      </div>
    </WhenVisible>
  </div>
</div>
