import { Link, WhenMounted } from '@inertiajs/react'
import WhenMountedChild from '@/Components/WhenMountedChild'
import WhenMountedFallback from '@/Components/WhenMountedFallback'

export default () => (
  <div>
    <h1 id="title">WhenMounted</h1>

    <WhenMounted fallback={<WhenMountedFallback />}>
      <p id="when-mounted-content">Client path: /when-mounted</p>
      <WhenMountedChild />
    </WhenMounted>

    <Link id="revisit-link" href="/when-mounted">
      Revisit
    </Link>
    <Link id="preserve-state-link" href="/when-mounted" preserveState>
      Revisit (preserve state)
    </Link>
    <Link id="leave-link" href="/">
      Leave
    </Link>
  </div>
)
