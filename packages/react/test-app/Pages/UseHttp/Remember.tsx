import { Link, useHttp } from '@inertiajs/react'

export default () => {
  const form = useHttp('useHttpRemember', {
    name: 'initial',
    email: '',
  })

  return (
    <div>
      <h1>useHttp Remember Test</h1>

      <label>
        Name
        <input type="text" id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
      </label>

      <label>
        Email
        <input type="text" id="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
      </label>

      <div id="current-values">
        Name: {form.data.name}, Email: {form.data.email}
      </div>
      <div id="is-dirty">isDirty: {form.isDirty.toString()}</div>

      <Link href="/dump/get" id="navigate-away">
        Navigate away
      </Link>
    </div>
  )
}
