import { Form } from '@inertiajs/react'
import { useRef } from 'react'

export default function PrecognitionDefaults() {
  const formRef = useRef<any>(null)

  const handleSetDefaults = () => {
    formRef.current?.defaults()
  }

  return (
    <div>
      <h1>Precognition - Defaults Updates Validator</h1>

      <Form ref={formRef} action="/form-component/precognition" method="post" validateTimeout={100}>
        {({ invalid, errors, validate, validating }) => (
          <>
            {validating && <p className="validating">Validating...</p>}

            <div>
              <input id="name-input" name="name" />
              {invalid('name') && <p className="error">{errors.name}</p>}
            </div>

            <button type="button" onClick={handleSetDefaults}>
              Set Defaults
            </button>
            <button type="button" onClick={() => validate('name')}>
              Validate Name
            </button>
            <button type="submit">Submit</button>
          </>
        )}
      </Form>
    </div>
  )
}
