import { InfiniteScroll } from '@inertiajs/react'
import UserCard, { User } from './UserCard'

export default ({ users }: { users: { data: User[] } }) => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Infinite Scroll in Container</h1>
      <p>This component scrolls within a fixed-height container, not the full page.</p>

      {/* Fixed height scrollable container */}
      <div
        data-testid="scroll-container"
        style={{
          height: '400px',
          width: '100%',
          border: '2px solid #ccc',
          overflowY: 'auto',
          background: '#f9f9f9',
          padding: '10px',
        }}
      >
        <InfiniteScroll
          data="users"
          style={{ display: 'grid', gap: '10px' }}
          loading={() => (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Loading more users...</div>
          )}
        >
          {users.data.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </InfiniteScroll>
      </div>

      <p style={{ marginTop: '20px' }}>Content below the scroll container to verify page doesn't scroll.</p>
    </div>
  )
}
