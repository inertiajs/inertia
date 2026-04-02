import { InfiniteScroll, usePage, WhenVisible } from '@inertiajs/react'
import UserCard, { User } from './UserCard'

const Users = () => {
  const { users } = usePage<{ users: { data: User[] } }>().props

  return (
    <InfiniteScroll
      data="users"
      style={{ display: 'grid', gap: '20px' }}
      manual
      previous={({ loading, fetch, hasMore }) => (
        <>
          <p>Has more previous items: {hasMore.toString()}</p>
          <button onClick={fetch}>{loading ? 'Loading previous items...' : 'Load previous items'}</button>
        </>
      )}
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
  )
}

export default ({ users }: { users?: { data: User[] } }) => {
  return (
    <div>
      <h1>Optional Scroll Prop + WhenVisible</h1>

      <div id="initial-state">Users prop present: {(!!users).toString()}</div>

      <div style={{ marginTop: '2000px' }}>
        <WhenVisible data="users" fallback={<div>Loading optional scroll prop...</div>}>
          <Users />
        </WhenVisible>
      </div>
    </div>
  )
}
