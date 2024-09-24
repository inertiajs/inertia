import { Link, useForm } from '@inertiajs/react'
import { ref } from 'vue'

export default (props) => {
  const untracked = ref('')

  const form = useForm({ name: 'foo', handle: 'example', remember: false })

  const submit = () => {
    form.post('/remember/form-helper/default')
  }

  return (
    <div>
      <label>
        Full Name
        <input type="text" id="name" name="name" v-model="form.name" />
      </label>
      {form.errors.name && <span className="name_error">{form.errors.name}</span>}
      <label>
        Handle
        <input type="text" id="handle" name="handle" v-model="form.handle" />
      </label>
      {form.errors.handle && <span className="handle_error">{form.errors.handle}</span>}
      <label>
        Remember Me
        <input type="checkbox" id="remember" name="remember" v-model="form.remember" />
      </label>
      {form.errors.remember && <span className="remember_error">{form.errors.remember}</span>}
      <label>
        Untracked
        <input type="text" id="untracked" name="untracked" v-model="untracked" />
      </label>

      <span onClick={submit} className="submit">
        Submit form
      </span>

      <Link href="/dump/get" className="link">
        Navigate away
      </Link>
    </div>
  )
}
