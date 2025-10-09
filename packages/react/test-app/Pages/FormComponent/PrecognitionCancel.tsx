import { Form } from '@inertiajs/react'

export default function PrecognitionCancel() {
  return (
    <div>
      <h1>Precognition - Auto Cancel</h1>

      <Form action="/form-component/precognition?slow=1" method="post" validateTimeout={100}>
        {({ invalid, errors, validate, validating }) => (
          <>
            {validating && <p className="validating">Validating...</p>}

            <div>
              <input id="name-input" name="name" onBlur={() => validate('name')} />
              {invalid('name') && <p className="error">{errors.name}</p>}
            </div>

            <button type="submit">Submit</button>
          </>
        )}
      </Form>
    </div>
  )
}
