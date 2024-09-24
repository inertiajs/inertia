import { Link } from '@inertiajs/react'

export default ({ method }) => {
  return (
    <div>
      <span className="text">This is the links page that demonstrates inertia-links without the 'as' warning</span>

      <Link method={method} href="/example" className="get" as="button">
        {method} button Link
      </Link>
    </div>
  )
}
