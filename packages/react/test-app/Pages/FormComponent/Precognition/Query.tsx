import { Form } from '@inertiajs/react'

export default () => {
  return (
    <div>
      <h1>Form Precognition (QUERY)</h1>

      <Form action="/precognition/default" method="query" validationTimeout={100}>
        {({ invalid, errors, validate, valid, validating }) => (
          <>
            <div>
              <input name="name" placeholder="Name" onBlur={() => validate('name')} />
              {invalid('name') && <p>{errors.name}</p>}
              {valid('name') && <p>Name is valid!</p>}
            </div>

            <div>
              <input name="email" placeholder="Email" onBlur={() => validate('email')} />
              {invalid('email') && <p>{errors.email}</p>}
              {valid('email') && <p>Email is valid!</p>}
            </div>

            {validating && <p>Validating...</p>}

            <button type="submit">Submit</button>
          </>
        )}
      </Form>
    </div>
  )
}
