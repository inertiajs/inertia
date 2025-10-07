import { Form } from '@inertiajs/react'
import { useState } from 'react'

export default function PrecognitionBeforeValidationPerCall() {
  const [blockedFirst, setBlockedFirst] = useState(false)
  const [blockedSecond, setBlockedSecond] = useState(false)

  const handleBeforeValidationFirst = () => {
    setBlockedFirst(true)
    return false
  }

  const handleBeforeValidationSecond = () => {
    setBlockedSecond(true)
    return false
  }

  return (
    <div>
      <h1>Precognition - onBeforeValidation Per Call</h1>

      <Form action="/form-component/precognition" method="post">
        {({ validate, validating }) => (
          <>
            {validating && <p className="validating">Validating...</p>}
            {blockedFirst && <p className="blocked-first">Blocked by first callback</p>}
            {blockedSecond && <p className="blocked-second">Blocked by second callback</p>}

            <div>
              <input id="name-input" name="name" />
            </div>

            {/* This button uses first callback */}
            <button
              type="button"
              onClick={() =>
                validate('name', {
                  onBeforeValidation: handleBeforeValidationFirst,
                })
              }
            >
              Validate with First
            </button>

            {/* This button uses second callback */}
            <button
              type="button"
              onClick={() =>
                validate('name', {
                  onBeforeValidation: handleBeforeValidationSecond,
                })
              }
            >
              Validate with Second
            </button>

            <button type="submit">Submit</button>
          </>
        )}
      </Form>
    </div>
  )
}
