import { Form } from '@inertiajs/react'

export default () => {
  return (
    <div>
      <h1>Form Precognition - All Errors</h1>

      <Form
        action="/form-component/precognition-array-errors"
        method="post"
        validateTimeout={100}
        simpleValidationErrors={false}
      >
        {({ invalid, errors, validate, valid, validating }) => (
          <>
            {validating && <p>Validating...</p>}

            <div>
              <input name="name" onBlur={() => validate('name')} />
              {invalid('name') && (
                <div>
                  {Array.isArray(errors.name) ? (
                    errors.name.map((error, index) => (
                      <p key={index} data-testid={`name-error-${index}`}>
                        {error}
                      </p>
                    ))
                  ) : (
                    <p data-testid="name-error-0">{errors.name}</p>
                  )}
                </div>
              )}
              {valid('name') && <p>Name is valid!</p>}
            </div>

            <div>
              <input name="email" onBlur={() => validate('email')} />
              {invalid('email') && (
                <div>
                  {Array.isArray(errors.email) ? (
                    errors.email.map((error, index) => (
                      <p key={index} data-testid={`email-error-${index}`}>
                        {error}
                      </p>
                    ))
                  ) : (
                    <p data-testid="email-error-0">{errors.email}</p>
                  )}
                </div>
              )}
              {valid('email') && <p>Email is valid!</p>}
            </div>
          </>
        )}
      </Form>
    </div>
  )
}
