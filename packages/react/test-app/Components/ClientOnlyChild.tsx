import { useEffect, useState } from 'react'

const ClientOnlyChild = () => {
  const [status, setStatus] = useState<'pending' | 'ready'>('pending')
  const [count, setCount] = useState(0)

  useEffect(() => {
    window._inertia_client_only_child_mounts = (window._inertia_client_only_child_mounts || 0) + 1

    const timer = setTimeout(() => setStatus('ready'), 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div>
      <span data-testid="child-status">{status}</span>
      <span data-testid="child-count">{count}</span>
      <button data-testid="child-increment" onClick={() => setCount((c) => c + 1)}>
        Increment
      </button>
    </div>
  )
}

export default ClientOnlyChild
