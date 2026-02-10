import { InfiniteScroll, useForm, usePage } from '@inertiajs/react'
import UserCard, { User } from './UserCard'

export default ({ users }: { users: { data: User[] } }) => {
  const { errors } = usePage().props as { errors?: { name?: string } }
  const form = useForm({ name: '' })

  const submit = () => {
    form.post('/infinite-scroll/preserve-errors')
  }

  return (
    <>
      {errors?.name && <p id="page-error">{errors.name}</p>}
      {form.errors.name && <p id="form-error">{form.errors.name}</p>}

      <button type="button" onClick={submit}>
        Submit
      </button>

      <InfiniteScroll
        data="users"
        style={{ display: 'grid', gap: '20px' }}
        manual
        previous={({ loading, fetch, hasMore }) =>
          hasMore ? (
            <button id="load-previous" onClick={fetch}>
              {loading ? 'Loading previous items...' : 'Load previous items'}
            </button>
          ) : null
        }
        next={({ loading, fetch, hasMore }) =>
          hasMore ? (
            <button id="load-next" onClick={fetch}>
              {loading ? 'Loading next items...' : 'Load next items'}
            </button>
          ) : null
        }
      >
        {users.data.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </InfiniteScroll>
    </>
  )
}
