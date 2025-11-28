import { Form } from '@inertiajs/react'

export default () => {
  return (
    <div>
      <h1>Precognition - Cancel Tests</h1>

      <h2>Auto Cancel Test</h2>
      <Form action="/precognition/default?slow=1" method="post" validationTimeout={100}>
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
    </div>
  )
}
