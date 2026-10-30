import { useProp } from '@inertiajs/react'

export default () => {
  const orders = useProp<string>('orders')

  return (
    <div>
      <h1 data-testid="ssr-title">SSR useProp</h1>
      <p id="orders" className={orders.loading ? 'loading' : ''}>
        orders: {orders.value ?? 'none'}, loading: {String(orders.loading)}
      </p>
    </div>
  )
}
