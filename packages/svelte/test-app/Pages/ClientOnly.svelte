<script lang="ts">
  import { ClientOnly } from '@inertiajs/svelte'
</script>

<div>
  <h1 data-testid="title">ClientOnly</h1>

  <ClientOnly>
    {#snippet fallback()}
      <p data-testid="client-only-fallback">Loading widget...</p>
    {/snippet}

    <p data-testid="client-only-content">Client path: /client-only</p>
  </ClientOnly>
</div>
