import { useForm } from '@inertiajs/react'
import { NamedInputEvent } from 'laravel-precognition'

export default () => {
  const form = useForm({
    name: '',
    email: '',
    company: '',
  })
    .withPrecognition('post', '/precognition/default')
    .setValidationTimeout(100)

  return (
    <div>
      <h1>Compatibility Test Page</h1>

      <div>
        <input
          value={form.data.name}
          name="name"
          placeholder="Name"
          onChange={(e) => form.setData('name', e.target.value)}
          onBlur={() => form.validate('name')}
        />
        {form.invalid('name') && <p id="name-error">{form.errors.name}</p>}
        {form.valid('name') && <p id="name-valid">Name is valid!</p>}
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
        {form.valid('email') && <p id="email-valid">Email is valid!</p>}
      </div>

      <div>
        <input
          value={form.data.company}
          name="company"
          placeholder="Company"
          onFocus={(e) => {
            const event = e as any as NamedInputEvent // eslint-disable-line @typescript-eslint/no-explicit-any
            form.forgetError(event)
            form.touch(event)
          }}
          onChange={(e) => form.setData('company', e.target.value)}
          onBlur={() => form.validate('company')}
        />
        {form.invalid('company') && <p id="company-error">{form.errors.company}</p>}
        {form.valid('company') && <p id="company-valid">company is valid!</p>}
      </div>

      {form.validating && <p id="validating">Validating...</p>}

      {/* Test compatibility methods */}
      <div style={{ marginTop: '20px' }}>
        <button
          type="button"
          id="test-setErrors"
          onClick={() =>
            form.setErrors({ name: 'setErrors test', email: 'setErrors email test', company: 'setErrors company test' })
          }
        >
          Test setErrors()
        </button>

        <button type="button" id="test-forgetError" onClick={() => form.forgetError('name')}>
          Test forgetError()
        </button>

        <button type="button" id="test-touch-array" onClick={() => form.touch(['name', 'email'])}>
          Test touch([])
        </button>

        <button type="button" id="test-touch-spread" onClick={() => form.touch('name', 'email')}>
          Test touch(...args)
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <p id="touched-name">Name touched: {form.touched('name') ? 'yes' : 'no'}</p>
        <p id="touched-email">Email touched: {form.touched('email') ? 'yes' : 'no'}</p>
        <p id="touched-company">Company touched: {form.touched('company') ? 'yes' : 'no'}</p>
        <p id="touched-any">Any touched: {form.touched() ? 'yes' : 'no'}</p>
      </div>
    </div>
  )
}
