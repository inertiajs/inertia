import { InfiniteScroll, Link, useForm } from '@inertiajs/react'
import { debounce } from 'lodash-es'
import { useCallback, useEffect } from 'react'
import UserCard, { User } from './UserCard'

interface Props {
  users: { data: User[] }
  filter?: string
  search?: string
}

export default ({ users, filter, search }: Props) => {
  const { data, setData, get } = useForm({
    filter: undefined,
    page: undefined,
    search: search,
  })

  const debouncedSearch = useCallback(
    debounce(() => {
      get('', { replace: true })
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
        <Link href="">No Filter</Link>
        <Link href="?filter=a-m">A-M</Link>
        <Link href="?filter=n-z">N-Z</Link>
        <div>Current filter: {filter || 'none'}</div>
        <div>Current search: {search || 'none'}</div>
        <input value={data.search || ''} onChange={handleSearchChange} placeholder="Search..." />
      </div>

      <InfiniteScroll
        data="users"
        style={{ display: 'grid', gap: '20px' }}
        loading={() => <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>}
      >
        {users.data.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </InfiniteScroll>

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <Link href="">No Filter</Link>
        <Link href="?filter=a-m">A-M</Link>
        <Link href="?filter=n-z">N-Z</Link>
        <div>Current filter: {filter || 'none'}</div>
        <div>Current search: {search || 'none'}</div>
        <input value={data.search || ''} onChange={handleSearchChange} placeholder="Search..." />
      </div>
    </div>
  )
}
