import { InfiniteScroll } from '@inertiajs/react'
import { useState } from 'react'
import UserCard, { User } from './UserCard'

export default ({ users }: { users: { data: User[] } }) => {
  const [manual, setManual] = useState(false)
  const [preserveUrl, setPreserveUrl] = useState(false)
  const [trigger, setTrigger] = useState<'start' | 'end' | 'both'>('end')

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <p>
          <label>
            <input type="checkbox" checked={manual} onChange={(e) => setManual(e.target.checked)} />
            Manual mode: {manual.toString()}
          </label>
        </p>

        <p>
          <label>
            <input type="checkbox" checked={preserveUrl} onChange={(e) => setPreserveUrl(e.target.checked)} />
            Preserve URL: {preserveUrl.toString()}
          </label>
        </p>

        <p>
          <label>
            Trigger: {trigger}
            <select value={trigger} onChange={(e) => setTrigger(e.target.value as 'start' | 'end' | 'both')}>
              <option value="start">start</option>
              <option value="end">end</option>
              <option value="both">both</option>
            </select>
          </label>
        </p>
      </div>

      <InfiniteScroll
        data="users"
        style={{ display: 'grid', gap: '20px' }}
        manual={manual}
        preserveUrl={preserveUrl}
        trigger={trigger}
        loading={<div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>}
      >
        {users.data.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </InfiniteScroll>

      <p>Total items on page: {users.data.length}</p>
    </div>
  )
}
