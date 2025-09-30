import { InfiniteScroll } from '@inertiajs/react'
import UserCard, { User } from './UserCard'

export default ({ users }: { users: { data: User[] } }) => {
  return (
    <InfiniteScroll
      data="users"
      style={{ display: 'grid', gap: '20px' }}
      manualAfter={2}
      next={({ fetch, manualMode, loading }) => (
        <>
          {loading && <p>Loading...</p>}

          <p>Manual mode: {manualMode.toString()}</p>

          {manualMode && <button onClick={fetch}>Load next items...</button>}
        </>
      )}
    >
      {users.data.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </InfiniteScroll>
  )
}
