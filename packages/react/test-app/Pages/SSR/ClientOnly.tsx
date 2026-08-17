import { ClientOnly } from '@inertiajs/react'

const clientPath = () => window.location.pathname

export default () => (
  <div>
    <h1 data-testid="ssr-title">SSR ClientOnly</h1>

    {/* JSX children are built eagerly, so `window` access needs the function form. */}
    <ClientOnly fallback={<p data-testid="client-only-fallback">Loading widget...</p>}>
      {() => <p data-testid="client-only-content">Client path: {clientPath()}</p>}
    </ClientOnly>
  </div>
)
