import { Link } from '@inertiajs/react'

export default ({ method }: { method: string }) => {
  return (
    <div>
      <span className="text">This is the links page that demonstrates inertia-links with an 'as' warning</span>

      <Link method={method as import('@inertiajs/core').Method} href="/example" className="get">
        {method} Link
      </Link>
    </div>
  )
}
