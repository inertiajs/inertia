import { InfiniteScroll, Link } from '@inertiajs/react'
import UserCard, { User } from './UserCard'

export default ({ users }: { users: { data: User[] } }) => {
  return (
    <div>
      <Link href="/infinite-scroll">Go back to Links</Link>
      <InfiniteScroll
        data="users"
        style={{ display: 'grid', gap: '20px' }}
        loading={() => <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>}
      >
        {users.data.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </InfiniteScroll>
    </div>
  )
}
