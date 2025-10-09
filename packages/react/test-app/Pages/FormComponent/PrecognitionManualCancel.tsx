import { Form } from '@inertiajs/react'

export default function PrecognitionManualCancel() {
  return (
    <div>
      <h1>Precognition - Manual Cancel</h1>

      <Form action="/form-component/precognition?slow=1" method="post" validateTimeout={5000}>
        {({ validate, cancelValidation, validating }) => (
          <>
            {validating && <p className="validating">Validating...</p>}

            <div>
              <input id="name-input" name="name" onBlur={() => validate('name')} />
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
