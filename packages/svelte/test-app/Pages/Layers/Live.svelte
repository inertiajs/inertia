<script lang="ts">
  import { useProp } from '@inertiajs/svelte'

  let { plain }: { plain: string } = $props()

  const order = useProp<string>('order')
</script>

<div>Live layer</div>

<div id="layer-order">{order.value}</div>
<div id="layer-order-loading">{order.loading}</div>
<div id="layer-plain">{plain}</div>
