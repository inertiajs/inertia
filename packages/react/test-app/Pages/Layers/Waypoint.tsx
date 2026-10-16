import { Link, router } from '@inertiajs/react'

export default ({ name, next }: { name: string; next: string }) => {
  const prefetchPanel = () => {
    router.prefetch('/layers/panel/first', {}, { cacheFor: '30s' })
  }

  const openPanelInstantly = () => {
    router.visit('/layers/panel/first', { component: 'Layers/Panel' })
  }

  return (
    <>
      <div id="waypoint">Waypoint {name}</div>

      <Link href={`/layers/waypoint/${next}`}>Go to the next waypoint</Link>

      <button onClick={prefetchPanel}>Prefetch the panel</button>
      <button onClick={openPanelInstantly}>Instantly open the panel</button>
    </>
  )
}
