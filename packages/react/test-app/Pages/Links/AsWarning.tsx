import { Link } from '@inertiajs/react'

export default ({ method }) => {
  return (
    <div>
      <span className="text">This is the links page that demonstrates inertia-links with an 'as' warning</span>

      <Link method={method} href="/example" className="get">
        {method} Link
      </Link>
    </div>
  )
}
