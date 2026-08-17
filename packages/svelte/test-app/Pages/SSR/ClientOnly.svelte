<script lang="ts">
  import { ClientOnly } from '@inertiajs/svelte'

  const clientPath = () => window.location.pathname
</script>

<div>
  <h1 data-testid="ssr-title">SSR ClientOnly</h1>

  <ClientOnly>
    {#snippet fallback()}
      <p data-testid="client-only-fallback">Loading widget...</p>
    {/snippet}

    <p data-testid="client-only-content">Client path: {clientPath()}</p>
  </ClientOnly>
</div>
