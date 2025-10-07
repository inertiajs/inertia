import { Form } from '@inertiajs/react'
import { useState } from 'react'

export default function PrecognitionException() {
  const [exceptionCaught, setExceptionCaught] = useState(false)
  const [exceptionMessage, setExceptionMessage] = useState('')

  const handleException = (error: Error) => {
    setExceptionCaught(true)
    setExceptionMessage(error.message || 'Unknown error')
  }

  return (
    <div>
      <h1>Precognition - onException</h1>

      <Form action="/form-component/precognition-exception" method="post">
        {({ validate, validating }) => (
          <>
            {validating && <p className="validating">Validating...</p>}
            {exceptionCaught && <p className="exception-caught">Exception caught: {exceptionMessage}</p>}

            <div>
              <input id="name-input" name="name" />
            </div>

            {/* This will trigger a validation request to a non-existent endpoint */}
            <button
              type="button"
              onClick={() =>
                validate('name', {
                  onException: handleException,
                })
              }
            >
              Validate with Exception Handler
            </button>

            <button type="submit">Submit</button>
          </>
        )}
      </Form>
    </div>
  )
}
