import { router } from '@inertiajs/react'
import { useState } from 'react'

export default () => {
  const [error, setError] = useState(false)

  function makeRequest() {
    setError(false)
    router.get('/network-error', {}, { onNetworkError: () => setError(true) })
  }

  return (
    <div>
      <h1>Network Error</h1>
      {error && <div id="network-error">Network error occurred</div>}
      <button id="make-request" onClick={makeRequest}>
        Make Request
      </button>
    </div>
  )
}
