import { InfiniteScroll } from '@inertiajs/react'
import { useMemo } from 'react'
import UserCard, { User } from './UserCard'

export default ({ users }: { users: { data: User[] } }) => {
  const reversedUsers = useMemo(() => [...users.data].reverse(), [users.data])

  return (
    <InfiniteScroll
      data="users"
      style={{ display: 'grid', gap: '20px' }}
      reverse
      autoScroll={false}
      loading={() => <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>}
    >
      {reversedUsers.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </InfiniteScroll>
  )
}
