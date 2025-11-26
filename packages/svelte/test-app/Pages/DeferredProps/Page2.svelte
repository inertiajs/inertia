<script lang="ts">
  import { Deferred } from '@inertiajs/svelte'

  interface Props {
    baz: string | undefined
    qux: string | undefined
  }

  let { baz, qux }: Props = $props()
</script>

<Deferred data="baz">
  {#snippet fallback()}
    <div>Loading baz...</div>
  {/snippet}
  {baz}
</Deferred>

<Deferred data="qux">
  {#snippet fallback()}
    <div>Loading qux...</div>
  {/snippet}
  {qux}
</Deferred>

<Deferred data={['baz', 'qux']}>
  {#snippet fallback()}
    <div>Loading baz and qux...</div>
  {/snippet}
  both {baz} and {qux}
</Deferred>
