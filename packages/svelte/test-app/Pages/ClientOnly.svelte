<script lang="ts">
  import { ClientOnly, inertia } from '@inertiajs/svelte'
  import ClientOnlyChild from '@/Components/ClientOnlyChild.svelte'
  import ClientOnlyFallback from '@/Components/ClientOnlyFallback.svelte'
</script>

<div>
  <h1 data-testid="title">ClientOnly</h1>

  <ClientOnly>
    {#snippet fallback()}
      <ClientOnlyFallback />
    {/snippet}

    <p data-testid="client-only-content">Client path: /client-only</p>
    <ClientOnlyChild />
  </ClientOnly>

  <a href="/client-only" use:inertia data-testid="revisit-link">Revisit</a>
  <a href="/client-only" use:inertia={{ preserveState: true }} data-testid="preserve-state-link">
    Revisit (preserve state)
  </a>
  <a href="/" use:inertia data-testid="leave-link">Leave</a>
</div>
