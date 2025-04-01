import { Link, useRemember } from '@inertiajs/react'
import { useState } from 'react'

export default (props) => {
  const [untracked, setUntracked] = useState('')

  const [form, setForm] = useRemember({ name: '', remember: false })

  return (
    <div>
      <label>
        Full Name
        <input
          type="text"
          id="name"
          name="full_name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </label>
      <label>
        Remember Me
        <input
          type="checkbox"
          id="remember"
          name="remember"
          checked={form.remember}
          onChange={(e) => setForm({ ...form, remember: e.target.checked })}
        />
      </label>
      <label>
        Untracked
        <input
          type="text"
          id="untracked"
          name="untracked"
          value={untracked}
          onChange={(e) => setUntracked(e.target.value)}
        />
      </label>

      <Link href="/dump/get" className="link">
        Navigate away
      </Link>
    </div>
  )
}
