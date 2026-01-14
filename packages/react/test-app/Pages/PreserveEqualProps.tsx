import { config, Link } from '@inertiajs/react'
import { useEffect, useState } from 'react'

export default ({ nestedA, nestedB }: { nestedA: { count: number }; nestedB: { date: number } }) => {
  const [effectACount, setEffectACount] = useState(0)
  const [effectBCount, setEffectBCount] = useState(0)

  useEffect(() => {
    setEffectACount((count) => count + 1)
  }, [nestedA])

  useEffect(() => {
    setEffectBCount((count) => count + 1)
  }, [nestedB])

  function enable() {
    config.set('future.preserveEqualProps', true)
  }

  return (
    <div>
      <h1>Preserve Equal Props</h1>
      <p id="count-a">Count A: {nestedA.count}</p>
      <p id="date-b">Date B: {nestedB.date}</p>
      <p id="effect-a">Effect A Count: {effectACount}</p>
      <p id="effect-b">Effect B Count: {effectBCount}</p>
      <Link method="post" href="/preserve-equal-props/back">
        Submit and redirect back
      </Link>
      <button onClick={enable}>Enable</button>
    </div>
  )
}
