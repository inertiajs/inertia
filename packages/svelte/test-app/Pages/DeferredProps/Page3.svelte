<script lang="ts">
  import { Deferred } from '@inertiajs/svelte'

  interface Props {
    alpha: string | undefined
    beta: string | undefined
  }

  let { alpha, beta }: Props = $props()
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
