import { useForm } from '@inertiajs/react'

interface User {
  id: number
  name: string
  email: string
}

export default ({ user, withRememberKey = false }: { user: User; withRememberKey?: boolean }) => {
  const form = withRememberKey
    ? useForm('EditUserForm', {
        name: user.name,
        email: user.email,
      })
    : useForm({
        name: user.name,
        email: user.email,
      })

  return (
    <div>
      <h1>Edit User {user.id}</h1>
      <p>With remember key: {String(withRememberKey)}</p>
      <form>
        <div>
          <label>Name:</label>
          <input type="text" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
        </div>
      </form>
    </div>
  )
}
