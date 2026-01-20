import { InfiniteScroll } from '@inertiajs/react'
import UserCard, { User } from './UserCard'

export default ({ users }: { users: { data: User[] } }) => {
  return (
    <InfiniteScroll
      data="users"
      buffer={200}
      onlyPrevious
      style={{ display: 'grid', gap: '20px' }}
      loading={() => <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>}
    >
      {users.data.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </InfiniteScroll>
  )
}
