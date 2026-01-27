<script>
  import { Deferred, router } from '@inertiajs/svelte'
  import ReloadResults from './ReloadResults.svelte'

  const handleReload = () => {
    router.reload({
      data: { page: 2 },
    })
  }
</script>

<Deferred data="results">
  <svelte:fragment slot="fallback">
    <div>Loading results...</div>
  </svelte:fragment>
  <ReloadResults />
</Deferred>

<button on:click={handleReload}>Reload with page 2</button>
