import { useForm } from '@inertiajs/react'

export default () => {
  const form = useForm({ name: '' })

  const submit = () => {
    form.post('/view-transition/form-errors', {
      viewTransition: (viewTransition) => {
        viewTransition.ready.then(() => console.log('ready'))
        viewTransition.updateCallbackDone.then(() => console.log('updateCallbackDone'))
        viewTransition.finished.then(() => console.log('finished'))
      },
    })
  }

  return (
    <div>
      <h1>View Transition Form Errors Test</h1>

      <label>
        Name
        <input
          type="text"
          id="name"
          name="name"
          onChange={(e) => form.setData('name', e.target.value)}
          value={form.data.name}
        />
      </label>

      {form.errors.name && <p className="name_error">{form.errors.name}</p>}

      <button onClick={submit} className="submit">
        Submit with View Transition
      </button>
    </div>
  )
}
