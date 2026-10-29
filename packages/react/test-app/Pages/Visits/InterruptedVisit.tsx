import { Link, router } from '@inertiajs/react'

export default ({ user, status }: { user: string; status: string }) => {
  const postComment = () => router.post('/visits/interrupted-visit', {}, { only: ['status'] })

  return (
    <div>
      <div>Signed in as {user}</div>
      <div>Status: {status}</div>

      <Link href="/visits/interrupted-visit/held">Open the held page</Link>
      <Link href="/visits/interrupted-visit/prefetched" prefetch="mount">
        Open the prefetched held page
      </Link>
      <Link href="/visits/interrupted-visit/clear-history">Open the history clearing page</Link>
      <button onClick={postComment}>Post comment</button>
      <button onClick={() => window.releaseHeldComponent?.()}>Release held component</button>
    </div>
  )
}
