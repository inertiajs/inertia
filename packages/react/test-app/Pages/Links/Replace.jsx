import { Link } from '@inertiajs/react'

export default (props) => {
  return (
    <div>
      <span className="text">This is the links page that demonstrates replace on Links</span>

      <Link href="/dump/get" replace className="replace">
        [State] Replace: true
      </Link>
      <Link href="/dump/get" replace={false} className="replace-false">
        [State] Replace: false
      </Link>
    </div>
  )
}
