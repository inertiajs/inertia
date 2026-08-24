<script lang="ts">
  import { useRemember } from '@inertiajs/svelte'

  const remembered = useRemember({ note: '' })
</script>

<div data-testid="ssr-layer">SSR layer</div>
<input bind:value={remembered.note} data-testid="ssr-layer-note" />
