import { InfiniteScroll } from '@inertiajs/react'
import UserCard, { User } from './UserCard'

export default ({ users }: { users: { data: User[] } }) => {
  return (
    <div>
      <h1>Infinite Scroll with Invisible First Child</h1>

      <InfiniteScroll
        data="users"
        style={{ display: 'grid', gap: '20px' }}
        loading={() => <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>}
      >
        <div style={{ display: 'none' }}>Hidden first element</div>

        {users.data.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </InfiniteScroll>
    </div>
  )
}
