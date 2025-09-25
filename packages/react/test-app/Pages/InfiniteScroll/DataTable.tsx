import { InfiniteScroll } from '@inertiajs/react'
import { User } from './UserCard'

export default ({ users }: { users: { data: User[] } }) => {
  return (
    <InfiniteScroll data="users" itemsElement="tbody">
      {({ loadingPrevious, loadingNext }) => (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px', border: '1px solid #ccc' }}>ID</th>
              <th style={{ padding: '8px', border: '1px solid #ccc' }}>Name</th>
            </tr>
          </thead>

          <tbody>
            {users.data.map((user) => (
              <tr key={user.id} data-user-id={user.id}>
                <td style={{ padding: '8px', border: '1px solid #ccc' }}>{user.id}</td>
                <td style={{ padding: '8px', border: '1px solid #ccc' }}>{user.name}</td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            {(loadingPrevious || loadingNext) && (
              <tr>
                <td colSpan={2} style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'center' }}>
                  Loading...
                </td>
              </tr>
            )}
          </tfoot>
        </table>
      )}
    </InfiniteScroll>
  )
}
