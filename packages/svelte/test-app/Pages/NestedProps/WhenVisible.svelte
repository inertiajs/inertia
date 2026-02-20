<script lang="ts">
  import { WhenVisible } from '@inertiajs/svelte'

  interface Props {
    stats?: {
      visitors: number
    }
  }

  let { stats = undefined }: Props = $props()
</script>

<div style="margin-top: 2000px; padding: 20px">
  <WhenVisible data="stats.visitors">
    {#snippet fallback()}
      <p id="loading">Loading visitors...</p>
    {/snippet}

    <p id="visitors">Visitors: {stats?.visitors}</p>
  </WhenVisible>
</div>
