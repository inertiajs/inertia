import { Form } from '@inertiajs/react'

export default () => {
  return (
    <div>
      <h1>Form Precognition - Array Errors</h1>

      <Form action="/form-component/precognition-array-errors" method="post" validateTimeout={100}>
        {({ invalid, errors, validate, valid, validating }) => (
          <>
            {validating && <p>Validating...</p>}

            <div>
              <input name="name" onBlur={() => validate('name')} />
              {invalid('name') && <p>{errors.name}</p>}
              {valid('name') && <p>Name is valid!</p>}
            </div>

            <div>
              <input name="email" onBlur={() => validate('email')} />
              {invalid('email') && <p>{errors.email}</p>}
              {valid('email') && <p>Email is valid!</p>}
            </div>
          </>
        )}
      </Form>
    </div>
  )
}
