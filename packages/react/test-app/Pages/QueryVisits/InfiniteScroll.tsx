import { InfiniteScroll, Link } from '@inertiajs/react'
import UserCard, { User } from '../InfiniteScroll/UserCard'

export default ({ term, users }: { term: string | null; users: { data: User[] } }) => {
  return (
    <div>
      <p id="term">Term: {term ?? 'nothing'}</p>

      <Link method="query" href="/query-visits/infinite-scroll" data={{ term: 'Apple' }}>
        Search Apple
      </Link>

      <InfiniteScroll
        data="users"
        style={{ display: 'grid', gap: '20px' }}
        manual
        next={({ loading, fetch, hasMore }) => (
          <>
            <p>Has more next items: {hasMore.toString()}</p>
            <button onClick={fetch}>{loading ? 'Loading next items...' : 'Load next items'}</button>
          </>
        )}
      >
        {users.data.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </InfiniteScroll>
    </div>
  )
}
