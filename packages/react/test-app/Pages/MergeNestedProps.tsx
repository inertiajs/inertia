import { router } from '@inertiajs/react'

export default ({
  users,
}: {
  users: { data: { id: number; name: string }[]; meta: { page: number; perPage: number } }
}) => {
  const loadMore = () => {
    router.reload({
      only: ['users'],
      data: { page: users.meta.page + 1 },
    })
  }

  return (
    <div>
      <p id="users">{users.data.map((user) => user.name).join(', ')}</p>
      <p id="meta">
        Page: {users.meta.page}, Per Page: {users.meta.perPage}
      </p>
      <button onClick={loadMore}>Load More</button>
    </div>
  )
}
