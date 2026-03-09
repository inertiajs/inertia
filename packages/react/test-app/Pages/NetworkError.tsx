import { router } from '@inertiajs/react'

export default ({ status }: { status?: string }) => (
  <div>
    <h1>Network Error</h1>
    <div id="status">{status ?? 'idle'}</div>
    <button id="make-request" onClick={() => router.get('/network-error')}>
      Make Request
    </button>
  </div>
)
