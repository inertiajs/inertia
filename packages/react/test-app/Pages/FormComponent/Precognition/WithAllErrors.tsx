import { Form } from '@inertiajs/react'

export default () => {
  return (
    <div>
      <h1>Form Precognition - All Errors</h1>

      <Form action="/precognition/with-all-errors" method="post" validationTimeout={100} withAllErrors>
        {({ invalid, errors, validate, valid, validating }) => (
          <>
            <div>
              <input name="name" placeholder="Name" onBlur={() => validate('name')} />
              {invalid('name') && (
                <div>
                  {Array.isArray(errors.name) ? (
                    errors.name.map((error, index) => (
                      <p key={index} id={`name-error-${index}`}>
                        {error}
                      </p>
                    ))
                  ) : (
                    <p id="name-error-0">{errors.name}</p>
                  )}
                </div>
              )}
              {valid('name') && <p>Name is valid!</p>}
            </div>

            <div>
              <input name="email" placeholder="Email" onBlur={() => validate('email')} />
              {invalid('email') && (
                <div>
                  {Array.isArray(errors.email) ? (
                    errors.email.map((error, index) => (
                      <p key={index} id={`email-error-${index}`}>
                        {error}
                      </p>
                    ))
                  ) : (
                    <p id="email-error-0">{errors.email}</p>
                  )}
                </div>
              )}
              {valid('email') && <p>Email is valid!</p>}
            </div>

            {validating && <p>Validating...</p>}
          </>
        )}
      </Form>
    </div>
  )
}
