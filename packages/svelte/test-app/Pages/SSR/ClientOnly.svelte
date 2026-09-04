<script lang="ts">
  import { ClientOnly, inertia } from '@inertiajs/svelte'
  import ClientOnlyFallback from '@/Components/ClientOnlyFallback.svelte'

  const clientPath = () => window.location.pathname
</script>

<div>
  <h1 data-testid="ssr-title">SSR ClientOnly</h1>

  <ClientOnly>
    {#snippet fallback()}
      <ClientOnlyFallback />
    {/snippet}

    <p data-testid="client-only-content">Client path: {clientPath()}</p>
  </ClientOnly>

  <a href="/ssr/page2" use:inertia data-testid="leave-link">Leave</a>
  <a href="/ssr/client-only" use:inertia data-testid="revisit-link">Revisit</a>
</div>
