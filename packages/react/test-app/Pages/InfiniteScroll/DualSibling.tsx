import { InfiniteScroll } from '@inertiajs/react'
import UserCard, { User } from './UserCard'

interface Props {
  users1: { data: User[] }
  users2: { data: User[] }
}

export default ({ users1, users2 }: Props) => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Dual Sibling InfiniteScroll</h1>
      <p style={{ marginBottom: '20px' }}>Two InfiniteScroll components side by side, sharing the window scroll</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <div>
          <h2>Users 1</h2>
          <InfiniteScroll
            data="users1"
            style={{ display: 'grid', gap: '20px' }}
            manual
            next={({ loading, fetch }) => (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <button onClick={fetch} disabled={loading}>
                  {loading ? 'Loading...' : 'Load More Users 1'}
                </button>
              </div>
            )}
          >
            {users1.data.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </InfiniteScroll>
        </div>

        <div>
          <h2>Users 2</h2>
          <InfiniteScroll
            data="users2"
            style={{ display: 'grid', gap: '20px' }}
            manual
            next={({ loading, fetch }) => (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <button onClick={fetch} disabled={loading}>
                  {loading ? 'Loading...' : 'Load More Users 2'}
                </button>
              </div>
            )}
          >
            {users2.data.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </InfiniteScroll>
        </div>
      </div>
    </div>
  )
}
