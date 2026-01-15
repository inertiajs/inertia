import { Form } from '@inertiajs/react'

export default () => {
  return (
    <div>
      <h1>Precognition Error Sync Test</h1>

      <Form action="/precognition/error-sync" method="post" validationTimeout={100}>
        {({ invalid, errors, validate, validating }) => (
          <>
            <div>
              <input name="name" placeholder="Name" onBlur={() => validate('name')} />
              {invalid('name') && <p id="name-error">{errors.name}</p>}
            </div>

            <div>
              <input name="email" placeholder="Email" onBlur={() => validate('email')} />
              {invalid('email') && <p id="email-error">{errors.email}</p>}
            </div>

            {validating && <p id="validating">Validating...</p>}

            <button type="submit" id="submit-btn">
              Submit
            </button>
          </>
        )}
      </Form>
    </div>
  )
}
