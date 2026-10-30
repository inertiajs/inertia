import { Link } from '@inertiajs/react'

export default ({ page, loadedAt }: { page: string; loadedAt: number }) => {
  return (
    <>
      <Link href="/history/prefetch/dashboard" prefetch cacheFor="1m">
        Dashboard
      </Link>
      <Link href="/history/prefetch/reports" prefetch cacheFor="1m">
        Reports
      </Link>
      <Link href="/history/prefetch/signed-out">Sign out</Link>

      <div>This is the {page} page.</div>
      <div>Loaded at: {loadedAt}</div>
    </>
  )
}
