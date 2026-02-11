import { config, useForm } from '@inertiajs/react'

export default () => {
  // Set global config for withAllErrors (no .withAllErrors() call on the form)
  config.set('form.withAllErrors', true)

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
        {form.invalid('name') && (
          <div>
            {Array.isArray(form.errors.name) ? (
              form.errors.name.map((error, index) => (
                <p key={index} id={`name-error-${index}`}>
                  {error}
                </p>
              ))
            ) : (
              <p id="name-error-0">{form.errors.name}</p>
            )}
          </div>
        )}
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
        {form.invalid('email') && (
          <div>
            {Array.isArray(form.errors.email) ? (
              form.errors.email.map((error, index) => (
                <p key={index} id={`email-error-${index}`}>
                  {error}
                </p>
              ))
            ) : (
              <p id="email-error-0">{form.errors.email}</p>
            )}
          </div>
        )}
        {form.valid('email') && <p>Email is valid!</p>}
      </div>

      {form.validating && <p>Validating...</p>}
    </div>
  )
}
