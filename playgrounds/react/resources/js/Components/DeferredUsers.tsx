import { usePage } from '@inertiajs/react'

export default () => {
  const users = usePage().props.users

  return users.map((user) => (
    <div key={user.id}>
      <p>
        #{user.id}: {user.name} ({user.email})
      </p>
    </div>
  ))
}
