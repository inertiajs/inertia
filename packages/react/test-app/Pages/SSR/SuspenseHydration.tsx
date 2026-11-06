import { Suspense, use, useEffect, useState } from 'react'

const pending =
  typeof window === 'undefined' ? null : new Promise<void>((resolve) => (window.resolveSuspendedContent = resolve))

const SuspendedContent = () => {
  if (pending) {
    use(pending)
  }

  return <p data-testid="suspended-content">Server rendered content</p>
}

const HydrationStatus = () => {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => setHydrated(true), [])

  return <p data-testid="hydration-status">Hydrated: {String(hydrated)}</p>
}

export default () => (
  <div>
    <h1 data-testid="ssr-title">SSR Suspense Hydration</h1>

    <HydrationStatus />

    <Suspense fallback={<p data-testid="suspense-fallback">Loading...</p>}>
      <SuspendedContent />
    </Suspense>
  </div>
)
