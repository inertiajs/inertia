import { Form } from '@inertiajs/react'

export default function PrecognitionHeaders() {
  return (
    <div>
      <h1>Precognition - Custom Headers</h1>

      <Form
        action="/precognition/headers"
        method="post"
        headers={{ 'X-Custom-Header': 'custom-value' }}
        validationTimeout={100}
      >
        {({ invalid, errors, validate, validating }) => (
          <>
            <div>
              <input name="name" placeholder="Name" onBlur={() => validate('name')} />
              {invalid('name') && <p>{errors.name}</p>}
            </div>

            {validating && <p>Validating...</p>}

            <button type="submit">Submit</button>
          </>
        )}
      </Form>
    </div>
  )
}
