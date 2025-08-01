import type { Method } from '@inertiajs/core'
import { Link } from '@inertiajs/react'

export default ({ method }: { method: Method }) => {
  return (
    <div>
      <span className="text">This is the links page that demonstrates inertia-links with an 'as' warning</span>

      <Link method={method} href="/example" className="get">
        {method} Link
      </Link>
    </div>
  )
}
