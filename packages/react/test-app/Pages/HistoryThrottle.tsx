import { Link, router } from '@inertiajs/react'
import { useState } from 'react'

export default function HistoryThrottle() {
  const [callCount, setCallCount] = useState(0)

  const triggerRapidStateUpdates = () => {
    for (let i = 0; i < 120; i++) {
      setCallCount(i + 1)
      router.remember({ value: i }, `key-${i}`)
    }
  }

  return (
    <div>
      <h1>History Throttle Test</h1>
      <p id="call-count">State updates: {callCount}</p>
      <button id="trigger" onClick={triggerRapidStateUpdates}>
        Trigger Rapid State Updates
      </button>
      <Link id="home-link" href="/">
        Go Home
      </Link>
    </div>
  )
}
