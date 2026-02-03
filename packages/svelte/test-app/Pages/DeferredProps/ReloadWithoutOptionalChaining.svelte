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
  {#snippet fallback()}
    <div>Loading results...</div>
  {/snippet}
  <ReloadResults />
</Deferred>

<button onclick={handleReload}>Reload with page 2</button>
