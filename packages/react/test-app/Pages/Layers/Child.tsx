import { useLayer } from '@inertiajs/react'

export default () => {
  const layer = useLayer()

  return (
    <>
      <div>Child layer</div>
      <button onClick={() => layer.emit('saved', { id: 5 })}>Emit saved</button>
      <button onClick={() => layer.close()}>Close myself</button>
    </>
  )
}
