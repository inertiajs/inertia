import { Link, router } from '@inertiajs/react'

export default ({ pageNumber, multiByte }: { pageNumber: string; multiByte: string }) => {
  const clearHistory = () => {
    router.clearHistory()
  }

  return (
    <>
      <Link href="/history/1">Page 1</Link>
      <Link href="/history/2">Page 2</Link>
      <Link href="/history/3">Page 3</Link>
      <Link href="/history/4">Page 4</Link>
      <Link href="/history/5">Page 5</Link>

      <button onClick={clearHistory}>Clear History</button>

      <div>This is page {pageNumber}.</div>
      <div>Multi byte character: {multiByte}</div>

      <div style={{ height: '5000px' }}></div>
    </>
  )
}
