import { WhenVisible, usePage } from '@inertiajs/react'

const Visitors = () => {
  const { stats } = usePage<{ stats?: { visitors: number } }>().props

  return <p id="visitors">Visitors: {stats?.visitors}</p>
}

export default () => {
  return (
    <div style={{ marginTop: '2000px', padding: '20px' }}>
      <WhenVisible data="stats.visitors" fallback={<p id="loading">Loading visitors...</p>}>
        <Visitors />
      </WhenVisible>
    </div>
  )
}
