import { useForm } from '@inertiajs/react'

export default () => {
  const form = useForm({ name: 'foo', handle: 'example', remember: false })

  const submit = () => {
    form.post('/form-helper/errors')
  }

  const clearErrors = () => {
    form.clearErrors()
  }

  const clearError = () => {
    form.clearErrors('handle')
  }

  const setErrors = () => {
    form.setError({
      name: 'Manually set Name error',
      handle: 'Manually set Handle error',
    })
  }

  const setError = () => {
    form.setError('handle', 'Manually set Handle error')
  }

  const resetAndClearErrors = () => {
    form.resetAndClearErrors()
  }

  const resetHandle = () => {
    form.resetAndClearErrors('handle')
  }

  return (
    <div>
      <label>
        Full Name
        <input
          type="text"
          id="name"
          name="name"
          onChange={(e) => form.setData('name', e.target.value)}
          value={form.data.name}
        />
      </label>
      {form.errors.name && <span className="name_error">{form.errors.name}</span>}
      <label>
        Handle
        <input
          type="text"
          id="handle"
          name="handle"
          onChange={(e) => form.setData('handle', e.target.value)}
          value={form.data.handle}
        />
      </label>
      {form.errors.handle && <span className="handle_error">{form.errors.handle}</span>}
      <label>
        Remember Me
        <input
          type="checkbox"
          id="remember"
          name="remember"
          onChange={(e) => form.setData('remember', e.target.checked)}
          checked={form.data.remember}
        />
      </label>
      {form.errors.remember && <span className="remember_error">{form.errors.remember}</span>}

      <button onClick={submit} className="submit">
        Submit form
      </button>

      <button onClick={clearErrors} className="clear">
        Clear all errors
      </button>
      <button onClick={clearError} className="clear-one">
        Clear one error
      </button>
      <button onClick={setErrors} className="set">
        Set errors
      </button>
      <button onClick={setError} className="set-one">
        Set one error
      </button>
      <button onClick={resetAndClearErrors} className="reset-all">
        Reset all
      </button>
      <button onClick={resetHandle} className="reset-handle">
        Reset handle
      </button>

      <span className="errors-status">Form has {form.hasErrors ? '' : 'no '}errors</span>
    </div>
  )
}
