import { Form } from '@inertiajs/react'

export default function PrecognitionHeaders() {
  return (
    <div>
      <h1>Precognition - Custom Headers</h1>

      <Form
        action="/form-component/precognition-headers"
        method="post"
        headers={{ 'X-Custom-Header': 'custom-value' }}
        validateTimeout={100}
      >
        {({ invalid, errors, validate, validating }) => (
          <>
            {validating && <p>Validating...</p>}

            <div>
              <input name="name" onBlur={() => validate('name')} />
              {invalid('name') && <p>{errors.name}</p>}
            </div>

            <button type="submit">Submit</button>
          </>
        )}
      </Form>
    </div>
  )
}
