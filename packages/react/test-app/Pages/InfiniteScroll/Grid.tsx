import { InfiniteScroll } from '@inertiajs/react'
import UserCard, { User } from './UserCard'

export default ({ users }: { users: { data: User[] } }) => {
  return (
    <InfiniteScroll
      data="users"
      style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}
      loading={() => (
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px' }}>Loading more users...</div>
      )}
    >
      {() => users.data.map((user) => <UserCard key={user.id} user={user} />)}
    </InfiniteScroll>
  )
}
