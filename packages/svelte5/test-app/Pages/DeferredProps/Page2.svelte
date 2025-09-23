<script lang="ts">
  import { Deferred } from '@inertiajs/svelte5'

  export let baz: string | undefined
  export let qux: string | undefined
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
