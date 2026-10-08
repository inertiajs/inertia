<script lang="ts">
  import { onMount } from 'svelte'
  import { counts } from './whenMountedCounts'

  const mounts = ++counts.childMounts
  const fallbackRenders = counts.fallbackRenders

  let status = $state<'pending' | 'ready'>('pending')
  let count = $state(0)

  onMount(() => {
    const timer = setTimeout(() => (status = 'ready'), 100)

    return () => clearTimeout(timer)
  })
</script>

<div>
  <span id="child-status">{status}</span>
  <span id="child-count">{count}</span>
  <span id="fallback-renders">{fallbackRenders}</span>
  <span id="child-mounts">{mounts}</span>
  <button id="child-increment" onclick={() => count++}>Increment</button>
</div>
