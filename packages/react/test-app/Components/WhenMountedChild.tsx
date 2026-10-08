import { useEffect, useState } from 'react'
import { counts } from './whenMountedCounts'

const WhenMountedChild = () => {
  const [status, setStatus] = useState<'pending' | 'ready'>('pending')
  const [count, setCount] = useState(0)
  // Lazy initializer, otherwise the expression would re-run on every render
  const [mounts] = useState(() => ++counts.childMounts)

  useEffect(() => {
    const timer = setTimeout(() => setStatus('ready'), 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div>
      <span id="child-status">{status}</span>
      <span id="child-count">{count}</span>
      <span id="fallback-renders">{counts.fallbackRenders}</span>
      <span id="child-mounts">{mounts}</span>
      <button id="child-increment" onClick={() => setCount((c) => c + 1)}>
        Increment
      </button>
    </div>
  )
}

export default WhenMountedChild
