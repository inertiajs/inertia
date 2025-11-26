<script lang="ts">
  import { Deferred } from '@inertiajs/svelte'

  export let alpha: string | undefined
  export let beta: string | undefined
</script>

<Deferred data="alpha">
  <div slot="fallback">Loading alpha...</div>
  {alpha}
</Deferred>

<Deferred data="beta">
  <div slot="fallback">Loading beta...</div>
  {beta}
</Deferred>
