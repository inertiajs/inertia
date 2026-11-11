import { useProp } from '@inertiajs/react'

export default ({ plain }: { plain: string }) => {
  const { value: order, loading } = useProp<string>('order')

  return (
    <>
      <div>Live layer</div>

      <div id="layer-order">{order}</div>
      <div id="layer-order-loading">{String(loading)}</div>
      <div id="layer-plain">{plain}</div>
    </>
  )
}
