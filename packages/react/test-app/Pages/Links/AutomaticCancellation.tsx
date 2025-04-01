import { Link } from '@inertiajs/react'

export default (props) => {
  return (
    <div>
      <span className="text">This is the links page that demonstrates that only one visit can be active at a time</span>
      <Link
        href="/sleep"
        className="visit"
        onCancel={() => console.log('cancelled')}
        onStart={() => console.log('started')}
      >
        Link
      </Link>
    </div>
  )
}
