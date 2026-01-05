import { Link, useForm } from '@inertiajs/react'

export default () => {
  const form = useForm('password-form', {
    username: '',
    password: '',
  }).dontRemember('password')

  return (
    <div>
      <label>
        Username
        <input
          type="text"
          id="username"
          value={form.data.username}
          onChange={(e) => form.setData('username', e.target.value)}
        />
      </label>
      <label>
        Password
        <input
          type="password"
          id="password"
          value={form.data.password}
          onChange={(e) => form.setData('password', e.target.value)}
        />
      </label>

      <Link href="/dump/get" className="link">
        Navigate away
      </Link>
    </div>
  )
}
