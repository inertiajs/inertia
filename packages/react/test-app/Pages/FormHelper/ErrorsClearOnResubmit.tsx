import { useForm } from '@inertiajs/react'

export default () => {
  const form = useForm({
    name: '',
    handle: '',
  })

  return (
    <div>
      <label>
        Name
        <input
          type="text"
          id="name"
          name="name"
          value={form.data.name}
          onChange={(e) => form.setData('name', e.target.value)}
        />
      </label>
      {form.errors.name && <span id="name-error">{form.errors.name}</span>}

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
      {form.errors.handle && <span id="handle-error">{form.errors.handle}</span>}

      <button onClick={() => form.post('/form-helper/errors/clear-on-resubmit')} id="submit">
        Submit
      </button>

      <span className="errors-status">Form has {form.hasErrors ? '' : 'no '}errors</span>
    </div>
  )
}
