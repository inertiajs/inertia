import { InfiniteScroll, Link, router } from '@inertiajs/react'
import UserCard, { User } from './UserCard'

export default ({ users }: { users: { data: User[] } }) => {
  function prependUser(id: number) {
    router.prependToProp('users.data', { id, name: `User ${id}` })
  }

  return (
    <>
      <div style={{ marginBottom: '40px', padding: '20px', borderTop: '2px solid #ccc' }}>
        <div style={{ marginBottom: '20px' }}>
          <button onClick={() => prependUser(0)} style={{ marginRight: '10px' }}>
            Prepend User '0'
          </button>
          <button onClick={() => prependUser(-1)} style={{ marginRight: '10px' }}>
            Prepend User '-1'
          </button>
        </div>
        <Link href="/home">Go Home</Link>
      </div>

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
