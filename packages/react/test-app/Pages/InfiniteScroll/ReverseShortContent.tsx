import { InfiniteScroll } from '@inertiajs/react'
import { useMemo } from 'react'

export default ({ users }: { users: { data: { id: number; name: string }[] } }) => {
  const reversedUsers = useMemo(() => [...users.data].reverse(), [users.data])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: '10px', borderBottom: '1px solid #ccc', flexShrink: 0 }}>Header</div>

      <div data-testid="scroll-container" style={{ flex: 1, overflowY: 'auto' }}>
        <InfiniteScroll
          data="users"
          style={{ display: 'grid', gap: '4px', padding: '20px' }}
          reverse
          loading={() => <div style={{ textAlign: 'center', padding: '10px' }}>Loading...</div>}
        >
          {reversedUsers.map((user) => (
            <div
              key={user.id}
              data-user-id={user.id}
              style={{ padding: '4px 8px', border: '1px solid #ddd', fontSize: '13px' }}
            >
              {user.name}
            </div>
          ))}
        </InfiniteScroll>
      </div>

      <div style={{ padding: '10px', borderTop: '1px solid #ccc', flexShrink: 0 }}>Footer</div>
    </div>
  )
}
