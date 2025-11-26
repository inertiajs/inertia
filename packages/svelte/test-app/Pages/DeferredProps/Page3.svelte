<script lang="ts">
  import { Deferred } from '@inertiajs/svelte'

  export let alpha: string | undefined
  export let beta: string | undefined
</script>

<Deferred data="alpha">
  {#snippet fallback()}
    <div>Loading alpha...</div>
  {/snippet}
  {alpha}
</Deferred>

<Deferred data="beta">
  {#snippet fallback()}
    <div>Loading beta...</div>
  {/snippet}
  {beta}
</Deferred>
