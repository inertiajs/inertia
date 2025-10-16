import { Form } from '@inertiajs/react'

export default () => {
  return (
    <div>
      <h1>Precognition - Cancel Tests</h1>

      <h2>Auto Cancel Test</h2>
      <Form action="/form-component/precognition?slow=1" method="post" validateTimeout={100}>
        {({ invalid, errors, validate, validating }) => (
          <>
            <div>
              <input id="auto-cancel-name-input" name="name" placeholder="Name" onBlur={() => validate('name')} />
              {invalid('name') && <p className="error">{errors.name}</p>}
            </div>

            {validating && <p className="validating">Validating...</p>}

            <button type="submit">Submit</button>
          </>
        )}
      </Form>

      <hr />

      <h2>Manual Cancel Test</h2>
      <Form action="/form-component/precognition?slow=1" method="post" validateTimeout={5000}>
        {({ validate, cancelValidation, validating }) => (
          <>
            <div>
              <input id="manual-cancel-name-input" name="name" placeholder="Name" onBlur={() => validate('name')} />
            </div>

            {validating && <p className="validating">Validating...</p>}

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
