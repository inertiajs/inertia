<script>
  import { Deferred, router } from '@inertiajs/svelte'

  export let results

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
  <div id="results-data">{results?.data?.join(', ')}</div>
  <div id="results-page">Page: {results?.page}</div>
</Deferred>

<button on:click={handleReload}>Reload with page 2</button>
