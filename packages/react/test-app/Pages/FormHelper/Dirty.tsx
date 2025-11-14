import { useForm } from '@inertiajs/react'

export default () => {
  const form = useForm({ name: 'foo', foo: [] as string[] })

  const submit = () => {
    form.post('')
  }

  const defaults = () => {
    form.setDefaults()
  }

  const dataAndDefaults = () => {
    pushValue()
    defaults()
  }

  const pushValue = () => {
    form.setData('foo', [...form.data.foo, 'bar'])
  }

  const submitAndSetDefaults = () => {
    form.post('/form-helper/dirty/redirect-back', {
      onSuccess: () => form.setDefaults(),
    })
  }

  const submitAndSetCustomDefaults = () => {
    form.post('/form-helper/dirty/redirect-back', {
      onSuccess: () => form.setDefaults({ name: 'Custom Default', foo: [] }),
    })
  }

  return (
    <div>
      <div>Form is {form.isDirty ? 'dirty' : 'clean'}</div>
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

      <button onClick={submit} className="submit">
        Submit form
      </button>

      <button onClick={defaults} className="defaults">
        Defaults
      </button>

      <button onClick={dataAndDefaults} className="data-and-defaults">
        Data and Defaults
      </button>

      <button onClick={pushValue}>Push Value</button>

      <button onClick={submitAndSetDefaults} className="submit-and-set-defaults">
        Submit and setDefaults
      </button>

      <button onClick={submitAndSetCustomDefaults} className="submit-and-set-custom-defaults">
        Submit and setDefaults custom
      </button>
    </div>
  )
}
