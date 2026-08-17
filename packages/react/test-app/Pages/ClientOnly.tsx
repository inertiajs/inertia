import { ClientOnly } from '@inertiajs/react'

export default () => (
  <div>
    <h1 data-testid="title">ClientOnly</h1>

    <ClientOnly fallback={<p data-testid="client-only-fallback">Loading widget...</p>}>
      <p data-testid="client-only-content">Client path: /client-only</p>
    </ClientOnly>
  </div>
)
