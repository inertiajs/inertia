import { Link, WhenMounted } from '@inertiajs/react'
import WhenMountedChild from '@/Components/WhenMountedChild'
import WhenMountedFallback from '@/Components/WhenMountedFallback'

const clientPath = () => window.location.pathname

export default () => (
  <div>
    <h1 data-testid="ssr-title">SSR WhenMounted</h1>

    {/* JSX children are built eagerly, so `window` access needs the function form */}
    <WhenMounted fallback={<WhenMountedFallback />}>
      {() => (
        <>
          <p data-testid="when-mounted-content">Client path: {clientPath()}</p>
          <WhenMountedChild />
        </>
      )}
    </WhenMounted>

    <Link data-testid="leave-link" href="/ssr/page2">
      Leave
    </Link>
    <Link data-testid="revisit-link" href="/ssr/when-mounted">
      Revisit
    </Link>
  </div>
)
