import { Link, useForm } from '@inertiajs/react'
import { ref } from 'vue'

export default (props) => {
  const form = useForm('form', { name: 'foo', handle: 'example', remember: false })
  const untracked = ref('')

  const submit = () => {
    form.post('/remember/form-helper/remember')
  }

  const reset = () => {
    form.reset('handle').clearErrors('name')
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
