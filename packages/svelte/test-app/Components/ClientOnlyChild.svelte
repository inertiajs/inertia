<script lang="ts">
  import { onMount } from 'svelte'

  let status = $state<'pending' | 'ready'>('pending')
  let count = $state(0)

  onMount(() => {
    window._inertia_client_only_child_mounts = (window._inertia_client_only_child_mounts || 0) + 1

    const timer = setTimeout(() => {
      status = 'ready'
    }, 100)

    return () => clearTimeout(timer)
  })
</script>

<div>
  <span data-testid="child-status">{status}</span>
  <span data-testid="child-count">{count}</span>
  <button data-testid="child-increment" onclick={() => count++}>Increment</button>
</div>
