import { InfiniteScroll } from '@inertiajs/react'
import { User } from './UserCard'

export default ({ users }: { users: { data: User[] } }) => {
  return (
    <div style={{ overflowX: 'hidden' }}>
      <InfiniteScroll data="users">
        {users.data.map((user) => (
          <div key={user.id} data-user-id={user.id}>
            <div>{user.name}</div>
          </div>
        ))}
      </InfiniteScroll>
    </div>
  )
}
