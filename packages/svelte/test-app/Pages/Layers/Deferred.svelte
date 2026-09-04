<script lang="ts">
  import { Deferred } from '@inertiajs/svelte'

  let { name, stats }: { name: string; stats?: number[] } = $props()
</script>

<div>Deferred layer: {name}</div>

<Deferred data="stats">
  {#snippet fallback()}
    <div data-testid="deferred-fallback">Loading stats...</div>
  {/snippet}
  <div data-testid="deferred-stats">{stats?.join(',')}</div>
</Deferred>
