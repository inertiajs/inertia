import { InfiniteScroll } from '@inertiajs/react'
import UserCard, { User } from '../InfiniteScroll/UserCard'

export default ({ users }: { users: { data: User[] } }) => {
  return (
    <>
      <div>Infinite layer</div>
      <InfiniteScroll
        data="users"
        style={{ display: 'grid', gap: '20px' }}
        manual
        previous={({ loading, fetch, hasMore }) => (
          <>
            <button onClick={fetch}>{loading ? 'Loading previous items...' : 'Load previous items'}</button>
            <span>Has more previous: {hasMore.toString()}</span>
          </>
        )}
        next={({ loading, fetch, hasMore }) => (
          <>
            <button onClick={fetch}>{loading ? 'Loading next items...' : 'Load next items'}</button>
            <span>Has more next: {hasMore.toString()}</span>
          </>
        )}
      >
        {users.data.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </InfiniteScroll>
    </>
  )
}
