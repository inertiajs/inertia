import { ClientOnly, Link } from '@inertiajs/react'
import ClientOnlyFallback from '@/Components/ClientOnlyFallback'

const clientPath = () => window.location.pathname

export default () => (
  <div>
    <h1 data-testid="ssr-title">SSR ClientOnly</h1>

    {/* JSX children are built eagerly, so `window` access needs the function form. */}
    <ClientOnly fallback={<ClientOnlyFallback />}>
      {() => <p data-testid="client-only-content">Client path: {clientPath()}</p>}
    </ClientOnly>

    <Link data-testid="leave-link" href="/ssr/page2">
      Leave
    </Link>
    <Link data-testid="revisit-link" href="/ssr/client-only">
      Revisit
    </Link>
  </div>
)
