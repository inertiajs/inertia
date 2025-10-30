import { InfiniteScroll } from '@inertiajs/react'
import UserCard, { User } from './UserCard'

interface Props {
  users1: { data: User[] }
  users2: { data: User[] }
}

export default ({ users1, users2 }: Props) => {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* First scroll container */}
        <div style={{ flex: 1 }}>
          <h2>Users1 Container</h2>
          <div
            data-testid="scroll-container-1"
            style={{
              height: '400px',
              width: '100%',
              border: '2px solid #3b82f6',
              overflowY: 'auto',
              background: '#f0f9ff',
              padding: '10px',
            }}
          >
            <InfiniteScroll
              data="users1"
              style={{ display: 'grid', gap: '10px' }}
              loading={() => (
                <div style={{ textAlign: 'center', padding: '20px', color: '#3b82f6' }}>Loading more users1...</div>
              )}
            >
              {users1.data.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </InfiniteScroll>
          </div>
        </div>

        {/* Second scroll container */}
        <div style={{ flex: 1 }}>
          <h2>Users2 Container</h2>
          <div
            data-testid="scroll-container-2"
            style={{
              height: '400px',
              width: '100%',
              border: '2px solid #ef4444',
              overflowY: 'auto',
              background: '#fef2f2',
              padding: '10px',
            }}
          >
            <InfiniteScroll
              data="users2"
              style={{ display: 'grid', gap: '10px' }}
              loading={() => (
                <div style={{ textAlign: 'center', padding: '20px', color: '#ef4444' }}>Loading more users2...</div>
              )}
            >
              {users2.data.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </InfiniteScroll>
          </div>
        </div>
      </div>

      <p style={{ marginTop: '20px' }}>Content below the scroll containers to verify page doesn't scroll.</p>
    </div>
  )
}
