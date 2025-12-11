import { useForm } from '@inertiajs/react'

export default () => {
  const form = useForm({
    name: '',
  })
    .withPrecognition('post', '/precognition/default')
    .setValidationTimeout(100)

  form.transform((data) => ({ name: String(data.name || '').repeat(2) }))

  return (
    <div>
      <div>
        <input
          value={form.data.name}
          name="name"
          placeholder="Name"
          onChange={(e) => form.setData('name', e.target.value)}
          onBlur={() => form.validate('name')}
        />
        {form.invalid('name') && <p>{form.errors.name}</p>}
        {form.valid('name') && <p>Name is valid!</p>}
      </div>

      {form.validating && <p>Validating...</p>}
    </div>
  )
}
