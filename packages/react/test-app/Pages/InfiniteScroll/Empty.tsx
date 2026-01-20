import { InfiniteScroll } from '@inertiajs/react'
import UserCard, { User } from './UserCard'

export default ({ users }: { users: { data: User[] } }) => {
  return (
    <div>
      <h1>Empty Dataset Test</h1>
      <InfiniteScroll
        data="users"
        style={{ display: 'grid', gap: '20px' }}
        loading={() => <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>}
      >
        {users.data.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}

        {users.data.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No users found.</div>
        )}
      </InfiniteScroll>
    </div>
  )
}
