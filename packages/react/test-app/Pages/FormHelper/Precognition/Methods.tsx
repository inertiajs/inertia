import { useForm } from '@inertiajs/react'

export default () => {
  const form = useForm({
    name: '',
    email: '',
  })
    .withPrecognition('post', '/precognition/default')
    .setValidationTimeout(100)

  return (
    <div>
      <div>
        <input
          name="name"
          value={form.data.name}
          placeholder="Name"
          onChange={(e) => form.setData('name', e.target.value)}
          onBlur={() => form.touch('name')}
        />
        {form.invalid('name') && <p>{form.errors.name}</p>}
      </div>

      <div>
        <input
          name="email"
          value={form.data.email}
          placeholder="Email"
          onChange={(e) => form.setData('email', e.target.value)}
          onBlur={() => form.touch('email')}
        />
        {form.invalid('email') && <p>{form.errors.email}</p>}
      </div>

      {form.validating && <p>Validating...</p>}

      <p id="name-touched">{form.touched('name') ? 'Name is touched' : 'Name is not touched'}</p>
      <p id="email-touched">{form.touched('email') ? 'Email is touched' : 'Email is not touched'}</p>
      <p id="any-touched">{form.touched() ? 'Form has touched fields' : 'Form has no touched fields'}</p>

      <button type="button" onClick={() => form.validate()}>
        Validate All Touched
      </button>
      <button type="button" onClick={() => form.validate('name')}>
        Validate Name
      </button>
      <button type="button" onClick={() => form.validate({ only: ['name', 'email'] })}>
        Validate Name and Email
      </button>
      <button type="button" onClick={() => form.touch('name', 'email')}>
        Touch Name and Email
      </button>
      <button
        type="button"
        onClick={() => {
          form.touch('name')
          form.touch('name')
        }}
      >
        Touch Name Twice
      </button>
      <button type="button" onClick={() => form.reset()}>
        Reset All
      </button>
      <button type="button" onClick={() => form.reset('name')}>
        Reset Name
      </button>
      <button type="button" onClick={() => form.reset('name', 'email')}>
        Reset Name and Email
      </button>
    </div>
  )
}
