import { Form } from '@inertiajs/react'

export default () => {
  return (
    <div>
      <h1>Form Precognition Validate</h1>

      <Form action="/form-component/precognition" method="post" validateTimeout={100}>
        {({ invalid, errors, validate, touch, validating }) => (
          <>
            {validating && <p>Validating...</p>}

            <div>
              <input name="name" onBlur={() => touch('name')} />
              {invalid('name') && <p>{errors.name}</p>}
            </div>

            <div>
              <input name="email" />
              {invalid('email') && <p>{errors.email}</p>}
            </div>

            <button type="button" onClick={() => validate('name')}>
              Validate Name
            </button>
            <button type="button" onClick={() => validate(['name', 'email'])}>
              Validate Name and Email
            </button>
          </>
        )}
      </Form>
    </div>
  )
}
