import { Link } from '@inertiajs/react'
export default (props) => {
  return (
    <div>
      <span className="text">This is the links page that demonstrates passing custom headers</span>
      <Link href="/dump/get" className="default">
        Standard visit Link
      </Link>

      <Link method="get" href="/dump/get" headers={{ foo: 'bar' }} className="custom">
        GET Link
      </Link>
      <Link
        as="button"
        method="post"
        href="/dump/post"
        headers={{ bar: 'baz', 'X-Requested-With': 'custom' }}
        className="overridden"
      >
        POST Link
      </Link>
    </div>
  )
}
