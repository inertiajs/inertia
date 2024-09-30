import { Link, useForm } from '@inertiajs/react'
import { useState } from 'react'

export default (props) => {
  const form = useForm('form', { name: 'foo', handle: 'example', remember: false })
  const [untracked, setUntracked] = useState('')

  const submit = () => {
    form.post('/remember/form-helper/remember')
  }

  const reset = () => {
    form.reset('handle')
    form.clearErrors('name')
  }

  return (
    <div>
      <label>
        Full Name
        <input
          type="text"
          id="name"
          name="name"
          value={form.data.name}
          onChange={(e) => form.setData('name', e.target.value)}
        />
      </label>
      {form.errors.name && <span className="name_error">{form.errors.name}</span>}
      <label>
        Handle
        <input
          type="text"
          id="handle"
          name="handle"
          value={form.data.handle}
          onChange={(e) => form.setData('handle', e.target.value)}
        />
      </label>
      {form.errors.handle && <span className="handle_error">{form.errors.handle}</span>}
      <label>
        Remember Me
        <input
          type="checkbox"
          id="remember"
          name="remember"
          checked={form.data.remember}
          onChange={(e) => form.setData('remember', e.target.checked)}
        />
      </label>
      {form.errors.remember && <span className="remember_error">{form.errors.remember}</span>}
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

      <button onClick={submit} className="submit">
        Submit form
      </button>
      <button onClick={reset} className="reset-one">
        Reset one field & error
      </button>

      <Link href="/dump/get" className="link">
        Navigate away
      </Link>
    </div>
  )
}
