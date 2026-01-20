import { InfiniteScroll } from '@inertiajs/react'
import { User } from './UserCard'

export default ({ users }: { users: { data: User[] } }) => {
  return (
    <InfiniteScroll data="users" itemsElement="tbody">
      {() => (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {users.data.map((user) => (
              <tr key={user.id} data-user-id={user.id}>
                <td style={{ padding: '10px', border: '1px solid #ccc' }}>{user.id}</td>
                <td style={{ padding: '10px', border: '1px solid #ccc' }}>{user.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </InfiniteScroll>
  )
}
