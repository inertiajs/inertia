import { Link } from '@inertiajs/react'

export default ({ page }) => {
  return (
    <>
      <h1 style={{ 'fontSize': '40px', }}>Page {page}</h1>

      <Link href="/links/cancel-sync-request/1">
        Go to Page 1
      </Link>
      <Link href="/links/cancel-sync-request/2">
        Go to Page 2
      </Link>
      <Link href="/links/cancel-sync-request/3">
        Go to Page 3
      </Link>
    </>
  )
}