import { InfiniteScroll } from '@inertiajs/react'
import { useRef } from 'react'
import { User } from './UserCard'

export default ({ users }: { users: { data: User[] } }) => {
  const tableHeader = useRef<HTMLTableSectionElement>(null)
  const tableFooter = useRef<HTMLTableSectionElement>(null)
  const tableBody = useRef<HTMLTableSectionElement>(null)

  return (
    <div style={{ padding: '20px' }}>
      <h1>Custom Triggers with React Ref Objects Test</h1>

      <InfiniteScroll data="users" startElement={tableHeader} endElement={tableFooter} itemsElement={tableBody}>
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
              <thead ref={tableHeader} style={{ padding: '10px' }}>
                <tr>
                  <th style={{ padding: '12px', border: '1px solid #ccc' }}>ID</th>
                  <th style={{ padding: '12px', border: '1px solid #ccc' }}>Name</th>
                </tr>
              </thead>

              <tbody ref={tableBody}>
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

              <tfoot ref={tableFooter} style={{ background: '#fdf2e8', padding: '10px' }}>
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
