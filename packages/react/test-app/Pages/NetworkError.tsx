import { router } from '@inertiajs/react'
import { useEffect, useState } from 'react'

export default () => {
  const [error, setError] = useState(false)

  useEffect(() => {
    return router.on('exception', () => {
      setError(true)
      return false
    })
  }, [])

  function makeRequest() {
    setError(false)
    router.get('/network-error')
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
