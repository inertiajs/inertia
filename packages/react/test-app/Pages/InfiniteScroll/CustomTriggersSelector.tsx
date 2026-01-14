import { InfiniteScroll } from '@inertiajs/react'
import { User } from './UserCard'

export default ({ users }: { users: { data: User[] } }) => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Custom Triggers with Selectors Test</h1>

      <InfiniteScroll data="users" itemsElement="#table-body" startElement="#table-header" endElement="#table-footer">
        {({ loadingPrevious, loadingNext }) => (
          <>
            <div
              style={{
                height: '300px',
                width: '100%',
                textAlign: 'center',
                lineHeight: '300px',
                border: '1px solid #ccc',
              }}
            >
              Spacer
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead id="table-header" style={{ padding: '12px' }}>
                <tr>
                  <th style={{ padding: '12px', border: '1px solid #ccc' }}>ID</th>
                  <th style={{ padding: '12px', border: '1px solid #ccc' }}>Name</th>
                </tr>
              </thead>

              <tbody id="table-body">
                {users.data.map((user) => (
                  <tr key={user.id} data-user-id={user.id}>
                    <td style={{ padding: '80px 12px', border: '1px solid #ccc' }}>{user.id}</td>
                    <td style={{ padding: '80px 12px', border: '1px solid #ccc' }}>{user.name}</td>
                  </tr>
                ))}

                {(loadingPrevious || loadingNext) && (
                  <tr>
                    <td colSpan={2} style={{ padding: '12px', border: '1px solid #ccc', textAlign: 'center' }}>
                      Loading...
                    </td>
                  </tr>
                )}
              </tbody>

              <tfoot id="table-footer" style={{ padding: '12px' }}>
                <tr>
                  <td colSpan={2} style={{ padding: '12px', border: '1px solid #ccc', textAlign: 'center' }}>
                    Table Footer - Triggers when this comes into view
                  </td>
                </tr>
              </tfoot>
            </table>

            <div
              style={{
                height: '300px',
                width: '100%',
                textAlign: 'center',
                lineHeight: '300px',
                border: '1px solid #ccc',
              }}
            >
              Spacer
            </div>
          </>
        )}
      </InfiniteScroll>
    </div>
  )
}
