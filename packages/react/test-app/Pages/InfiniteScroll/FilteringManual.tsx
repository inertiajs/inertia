import { InfiniteScroll, useForm } from '@inertiajs/react'
import { debounce } from 'lodash-es'
import { useEffect, useMemo } from 'react'
import UserCard, { User } from './UserCard'

interface Props {
  users: { data: User[] }
  search?: string
}

export default ({ users, search }: Props) => {
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
        style={{ display: 'grid', gap: '20px' }}
        manual
        previous={({ loading, fetch, hasMore }) => (
          <>
            <p>Has more previous items: {hasMore.toString()}</p>
            <button onClick={fetch}>{loading ? 'Loading previous items...' : 'Load previous items'}</button>
          </>
        )}
        next={({ loading, fetch, hasMore }) => (
          <>
            <p>Has more next items: {hasMore.toString()}</p>
            <button onClick={fetch}>{loading ? 'Loading next items...' : 'Load next items'}</button>
          </>
        )}
      >
        {users.data.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </InfiniteScroll>
    </div>
  )
}
