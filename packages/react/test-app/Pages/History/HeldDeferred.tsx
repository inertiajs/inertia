import { interceptors } from '@inertiajs/core'
import { Deferred, Link } from '@inertiajs/react'
import { useEffect } from 'react'

export default ({ page, comments }: { page: string; comments?: string }) => {
  useEffect(() => {
    if (page !== 'post') {
      return
    }

    return interceptors.onVisitResponse(async (visit, response) => {
      if (visit.deferredProps) {
        await new Promise<void>((resolve) => (window.releaseHeldResponse = resolve))
      }

      return response
    })
  }, [page])

  return (
    <>
      <div>This is the {page} page.</div>

      <Link href="/history/held-deferred/post">Open the post</Link>
      <button onClick={() => window.releaseHeldResponse?.()}>Release held response</button>

      {page === 'post' && (
        <Deferred data="comments" fallback={<div>Loading comments...</div>}>
          <div>{comments}</div>
        </Deferred>
      )}
    </>
  )
}
