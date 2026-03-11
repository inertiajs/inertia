import { router } from '@inertiajs/react'
import { useState } from 'react'
;(window as any)._inertia_router = router

export default ({ status }: { status?: string }) => {
  const [error, setError] = useState(false)

  function makeRequest() {
    setError(false)
    router.get('/network-error', {}, { onNetworkError: () => setError(true) })
  }

  return (
    <div>
      <h1>Network Error</h1>
      <div id="status">{status ?? 'idle'}</div>
      {error && <div id="network-error">Network error occurred</div>}
      <button id="make-request" onClick={makeRequest}>
        Make Request
      </button>
    </div>
  )
}
