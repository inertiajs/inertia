import { router, usePage } from '@inertiajs/react'

export default () => {
  const { feed } = usePage<{
    feed: {
      posts: { id: number; title: string }[]
      meta: { page: number }
    }
  }>().props

  const loadMore = () => {
    router.reload({
      only: ['feed'],
      data: { page: feed.meta.page + 1 },
    })
  }

  return (
    <>
      <p id="posts">{feed.posts.map((p) => p.title).join(', ')}</p>
      <p id="meta">Page: {feed.meta.page}</p>
      <button onClick={loadMore}>Load More</button>
    </>
  )
}
