import { Link } from '@inertiajs/react'

export default () => {
  return (
    <div>
      <span id="text">DefaultLayout/Index</span>
      <Link href="/default-layout/with-own-layout">With Own Layout</Link>
      <Link href="/default-layout/callback-excluded">Callback Excluded</Link>
    </div>
  )
}
