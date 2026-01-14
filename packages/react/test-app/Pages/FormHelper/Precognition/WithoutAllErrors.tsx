import { useForm } from '@inertiajs/react'

export default () => {
  const form = useForm({
    name: '',
    email: '',
  })
    .withPrecognition('post', '/precognition/with-all-errors')
    .setValidationTimeout(100)

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

      <div>
        <input
          value={form.data.email}
          name="email"
          placeholder="Email"
          onChange={(e) => form.setData('email', e.target.value)}
          onBlur={() => form.validate('email')}
        />
        {form.invalid('email') && <p>{form.errors.email}</p>}
        {form.valid('email') && <p>Email is valid!</p>}
      </div>

      {form.validating && <p>Validating...</p>}
    </div>
  )
}
