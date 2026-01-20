import { Link } from '@inertiajs/react'

interface User {
  id: number
  name: string
  email: string
}

export default ({ users }: { users: User[] }) => {
  return (
    <div>
      <h1>Users Index</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <Link href={`/remember/users/${user.id}/edit`}>Edit {user.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
