import { useForm, usePage } from '@inertiajs/react'

export default () => {
  const form = useForm({
    name: 'foo',
    handle: 'example',
    remember: false,
  })

  const page = usePage()

  const submit = () => {
    form.post(page.url)
  }

  const submitAndReset = () => {
    form.post('/form-helper/data/redirect-back', {
      onSuccess: () => form.reset(),
    })
  }

  const resetAll = () => {
    form.reset()
  }

  const resetOne = () => {
    form.reset('handle')
  }

  const reassign = () => {
    form.setDefaults()
  }

  const reassignObject = () => {
    form.setDefaults({ handle: 'updated handle', remember: true })
  }

  const reassignSingle = () => {
    form.setDefaults('name', 'single value')
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

      <button onClick={submitAndReset} className="submit">
        Submit form and reset
      </button>

      <button onClick={resetAll} className="reset">
        Reset all data
      </button>
      <button onClick={resetOne} className="reset-one">
        Reset one field
      </button>

      <button onClick={reassign} className="reassign">
        Reassign current as defaults
      </button>
      <button onClick={reassignObject} className="reassign-object">
        Reassign default values
      </button>
      <button onClick={reassignSingle} className="reassign-single">
        Reassign single default
      </button>

      <span className="errors-status">Form has {form.hasErrors ? '' : 'no '}errors</span>
    </div>
  )
}
