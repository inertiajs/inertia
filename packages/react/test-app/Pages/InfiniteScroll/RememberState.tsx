import { InfiniteScroll, Link } from '@inertiajs/react'
import UserCard, { User } from './UserCard'

export default ({ users }: { users: { data: User[] } }) => {
  return (
    <>
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

      <div style={{ marginTop: '40px', padding: '20px', borderTop: '2px solid #ccc' }}>
        <Link href="/home">Go to Home</Link>
      </div>
    </>
  )
}
