<script lang="ts">
  import { Deferred } from '@inertiajs/svelte5'

  const { baz, qux }: { baz?: string; qux?: string } = $props()
</script>

<Deferred data="baz">
  {baz}
  {#snippet fallback()}
    <div>Loading baz...</div>
  {/snippet}
</Deferred>

<Deferred data="qux">
  {qux}
  {#snippet fallback()}
    <div>Loading qux...</div>
  {/snippet}
</Deferred>

<Deferred data={['baz', 'qux']}>
  both {baz} and {qux}
  {#snippet fallback()}
    <div>Loading baz and qux...</div>
  {/snippet}
</Deferred>
