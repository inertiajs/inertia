import { InfiniteScroll } from '@inertiajs/react'

export default ({ users }: { users: { data: { id: number; name: string }[] } }) => {
  return (
    <div>
      <h1 data-testid="ssr-title">SSR Infinite Scroll</h1>

      <InfiniteScroll
        data="users"
        manual
        previous={({ hasMore }) => <p data-testid="has-previous">Has previous: {hasMore.toString()}</p>}
        next={({ hasMore }) => <p data-testid="has-next">Has next: {hasMore.toString()}</p>}
      >
        {users.data.map((user) => (
          <div key={user.id} data-testid="user">
            {user.name}
          </div>
        ))}
      </InfiniteScroll>
    </div>
  )
}
