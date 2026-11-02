<script lang="ts">
  import { useProp } from '@inertiajs/svelte'

  const orders = useProp<string>('orders')
</script>

<div>
  <h1 data-testid="ssr-title">SSR useProp</h1>
  <p id="orders" class={orders.loading ? 'loading' : ''}>
    orders: {orders.value ?? 'none'}, loading: {orders.loading}
  </p>
</div>
