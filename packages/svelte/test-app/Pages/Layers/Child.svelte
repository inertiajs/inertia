<script lang="ts">
  import { useLayer } from '@inertiajs/svelte'

  const layer = useLayer()
</script>

<div>Child layer</div>
<button onclick={() => layer.emit('saved', { id: 5 })}>Emit saved</button>
<button onclick={() => layer.close()}>Close myself</button>
