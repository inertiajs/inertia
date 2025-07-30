import { useForm } from '@inertiajs/react'

export default ({}) => {
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
    </div>
  )
}
