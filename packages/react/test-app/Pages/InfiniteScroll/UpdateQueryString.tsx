import { InfiniteScroll, usePage } from '@inertiajs/react'
import UserCard, { User } from './UserCard'

export default ({ users }: { users: { data: User[] } }) => {
  const page = usePage()

  window.testing = {
    ...(window.testing || {}),
    get pageUrl() {
      return page.url
    },
  }

  return (
    <InfiniteScroll
      data="users"
      style={{ display: 'grid', gap: '20px' }}
      loading={() => <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>}
    >
      {users.data.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </InfiniteScroll>
  )
}
