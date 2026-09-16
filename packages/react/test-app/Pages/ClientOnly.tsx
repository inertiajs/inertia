import { ClientOnly, Link } from '@inertiajs/react'
import ClientOnlyChild from '@/Components/ClientOnlyChild'
import ClientOnlyFallback from '@/Components/ClientOnlyFallback'

export default () => (
  <div>
    <h1 data-testid="title">ClientOnly</h1>

    <ClientOnly fallback={<ClientOnlyFallback />}>
      <p data-testid="client-only-content">Client path: /client-only</p>
      <ClientOnlyChild />
    </ClientOnly>

    <Link data-testid="revisit-link" href="/client-only">
      Revisit
    </Link>
    <Link data-testid="preserve-state-link" href="/client-only" preserveState>
      Revisit (preserve state)
    </Link>
    <Link data-testid="leave-link" href="/">
      Leave
    </Link>
  </div>
)
