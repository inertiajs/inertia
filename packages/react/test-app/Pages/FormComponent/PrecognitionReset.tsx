import { Form } from '@inertiajs/react'

export default () => {
  return (
    <div>
      <h1>Form Precognition Reset</h1>

      <Form action="/form-component/precognition" method="post" validateTimeout={100}>
        {({ invalid, errors, validate, touch, validating, reset }) => (
          <>
            {validating && <p>Validating...</p>}

            <div>
              <input name="name" onBlur={() => touch('name')} />
              {invalid('name') && <p>{errors.name}</p>}
            </div>

            <div>
              <input name="email" onBlur={() => touch('email')} />
              {invalid('email') && <p>{errors.email}</p>}
            </div>

            <button type="button" onClick={() => validate()}>
              Validate All Touched
            </button>
            <button type="button" onClick={() => reset()}>
              Reset All
            </button>
            <button type="button" onClick={() => reset('name')}>
              Reset Name
            </button>
            <button type="button" onClick={() => reset('name', 'email')}>
              Reset Name and Email
            </button>
          </>
        )}
      </Form>
    </div>
  )
}
