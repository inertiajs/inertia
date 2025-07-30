import { Link } from '@inertiajs/react'
import type { Method } from '@inertiajs/core'

export default ({ method }: { method: string }) => {
  return (
    <div>
      <span className="text">This is the links page that demonstrates inertia-links without the 'as' warning</span>

      <Link method={method as Method} href="/example" className="get" as="button">
        {method} button Link
      </Link>
    </div>
  )
}
