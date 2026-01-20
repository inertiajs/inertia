import { Link } from '@inertiajs/react'

export default ({ navigatedTo }: { navigatedTo: boolean }) => (
  <div>
    <h1 data-testid="ssr-title">SSR Page 2</h1>
    <p data-testid="navigated-status">Navigated: {String(navigatedTo)}</p>

    <Link href="/ssr/page1" data-testid="back-link">
      Go back
    </Link>
  </div>
)
