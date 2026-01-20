import { InfiniteScroll, useForm } from '@inertiajs/react'
import { debounce } from 'lodash-es'
import { useEffect, useMemo } from 'react'
import UserCard, { User } from './UserCard'

export default ({ users, search }: { users: { data: User[] }; search?: string }) => {
  const { data, setData, get } = useForm({
    search: search,
  })

  const debouncedSearch = useMemo(
    () =>
      debounce(() => {
        get('', {
          preserveState: true,
          replace: true,
          only: ['users', 'search'],
          reset: ['users'],
        })
      }, 250),
    [get],
  )

  useEffect(() => {
    if (data.search !== search) {
      debouncedSearch()
    }
  }, [data.search, search, debouncedSearch])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData('search', e.target.value)
  }

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <div>Current search: {search || 'none'}</div>
        <input value={data.search || ''} onChange={handleSearchChange} placeholder="Search..." />
      </div>

      <InfiniteScroll
        data="users"
        buffer={2000}
        style={{ display: 'grid', gap: '20px' }}
        loading={() => <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>}
      >
        {users.data.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </InfiniteScroll>
    </div>
  )
}
