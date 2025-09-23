<script lang="ts">
  import { Deferred } from '@inertiajs/svelte'

  export let baz: string | undefined
  export let qux: string | undefined
</script>

<Deferred data="baz">
  <div slot="fallback">Loading baz...</div>
  {baz}
</Deferred>

<Deferred data="qux">
  <div slot="fallback">Loading qux...</div>
  {qux}
</Deferred>

<Deferred data={['baz', 'qux']}>
  <div slot="fallback">Loading baz and qux...</div>
  both {baz} and {qux}
</Deferred>
