import { useForm } from '@inertiajs/react'

export default () => {
  const form = useForm({
    name: '',
    email: '',
  })
    .withPrecognition('post', '/precognition/error-sync')
    .setValidationTimeout(100)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    form.submit()
  }

  return (
    <div>
      <h1>Precognition Error Sync Test (Form Helper)</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <input
            value={form.data.name}
            name="name"
            placeholder="Name"
            onChange={(e) => form.setData('name', e.target.value)}
            onBlur={() => form.validate('name')}
          />
          {form.invalid('name') && <p id="name-error">{form.errors.name}</p>}
        </div>

        <div>
          <input
            value={form.data.email}
            name="email"
            placeholder="Email"
            onChange={(e) => form.setData('email', e.target.value)}
            onBlur={() => form.validate('email')}
          />
          {form.invalid('email') && <p id="email-error">{form.errors.email}</p>}
        </div>

        {form.validating && <p id="validating">Validating...</p>}

        <button type="submit" id="submit-btn">
          Submit
        </button>
      </form>
    </div>
  )
}
