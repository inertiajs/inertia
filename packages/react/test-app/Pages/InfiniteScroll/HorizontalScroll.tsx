import { InfiniteScroll } from '@inertiajs/react'
import { User } from './UserCard'

export default ({ users }: { users: { data: User[] } }) => {
  return (
    <div style={{ height: '120px', overflowX: 'scroll', display: 'flex', width: '100vw' }}>
      <InfiniteScroll
        data="users"
        style={{ display: 'flex', gap: '20px', height: '120px' }}
        loading={() => (
          <div
            style={{
              minWidth: '150px',
              height: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px dashed #ccc',
              marginLeft: '20px',
              marginRight: '20px',
            }}
          >
            Loading...
          </div>
        )}
      >
        {users.data.map((user) => (
          <div
            key={user.id}
            data-user-id={user.id}
            style={{
              minWidth: '200px',
              height: '100px',
              border: '1px solid #ccc',
              backgroundColor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 'none',
            }}
          >
            {user.name}
          </div>
        ))}
      </InfiniteScroll>
    </div>
  )
}
