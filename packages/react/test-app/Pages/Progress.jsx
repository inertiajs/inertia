import { Link } from '@inertiajs/react'

export default ({ pageNumber }) => {
  return (
    <>
      <h1>Page {pageNumber}</h1>
      <Link href="/progress/1">Page 1</Link>
      <Link href="/progress/2">Page 2</Link>
      <Link prefetch href="/progress/3">
        Page 3
      </Link>
    </>
  )
}
