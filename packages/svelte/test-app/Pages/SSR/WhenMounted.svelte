<script lang="ts">
  import { inertia, WhenMounted } from '@inertiajs/svelte'
  import WhenMountedChild from '@/Components/WhenMountedChild.svelte'
  import WhenMountedFallback from '@/Components/WhenMountedFallback.svelte'

  const clientPath = () => window.location.pathname
</script>

<div>
  <h1 data-testid="ssr-title">SSR WhenMounted</h1>

  <WhenMounted>
    {#snippet fallback()}
      <WhenMountedFallback />
    {/snippet}

    <p data-testid="when-mounted-content">Client path: {clientPath()}</p>
    <WhenMountedChild />
  </WhenMounted>

  <a href="/ssr/page2" use:inertia data-testid="leave-link">Leave</a>
  <a href="/ssr/when-mounted" use:inertia data-testid="revisit-link">Revisit</a>
</div>
