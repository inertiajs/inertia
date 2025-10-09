import { Form } from '@inertiajs/react'

export default () => {
  return (
    <div>
      <h1>Precognition - Cancel Tests</h1>

      <h2>Auto Cancel Test</h2>
      <Form action="/form-component/precognition?slow=1" method="post" validateTimeout={100}>
        {({ invalid, errors, validate, validating }) => (
          <>
            {validating && <p className="validating">Validating...</p>}

            <div>
              <input id="auto-cancel-name-input" name="name" onBlur={() => validate('name')} />
              {invalid('name') && <p className="error">{errors.name}</p>}
            </div>

            <button type="submit">Submit</button>
          </>
        )}
      </Form>

      <hr />

      <h2>Manual Cancel Test</h2>
      <Form action="/form-component/precognition?slow=1" method="post" validateTimeout={5000}>
        {({ validate, cancelValidation, validating }) => (
          <>
            {validating && <p className="validating">Validating...</p>}

            <div>
              <input id="manual-cancel-name-input" name="name" onBlur={() => validate('name')} />
            </div>

            <button type="button" onClick={() => cancelValidation()}>
              Cancel Validation
            </button>
            <button type="submit">Submit</button>
          </>
        )}
      </Form>
    </div>
  )
}
