<script>
  import { Deferred, router } from '@inertiajs/svelte'

  let { results } = $props()

  const handleReload = () => {
    router.reload({
      data: { page: 2 },
    })
  }
</script>

<Deferred data="results">
  {#snippet fallback()}
    <div>Loading results...</div>
  {/snippet}
  <div id="results-data">{results?.data?.join(', ')}</div>
  <div id="results-page">Page: {results?.page}</div>
</Deferred>

<button onclick={handleReload}>Reload with page 2</button>
