<script lang="ts">
  import { inertia, WhenMounted } from '@inertiajs/svelte'
  import WhenMountedChild from '@/Components/WhenMountedChild.svelte'
  import WhenMountedFallback from '@/Components/WhenMountedFallback.svelte'
</script>

<div>
  <h1 id="title">WhenMounted</h1>

  <WhenMounted>
    {#snippet fallback()}
      <WhenMountedFallback />
    {/snippet}

    <p id="when-mounted-content">Client path: /when-mounted</p>
    <WhenMountedChild />
  </WhenMounted>

  <a href="/when-mounted" use:inertia id="revisit-link">Revisit</a>
  <a href="/when-mounted" use:inertia={{ preserveState: true }} id="preserve-state-link">Revisit (preserve state)</a>
  <a href="/" use:inertia id="leave-link">Leave</a>
</div>
