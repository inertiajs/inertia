import { Form } from '@inertiajs/react'
import { useState } from 'react'

export default function PrecognitionBeforeValidation() {
  const [blocked, setBlocked] = useState(false)
  const [dataCorrect, setDataCorrect] = useState(false)

  const handleBeforeValidation = (
    newRequest: { data: Record<string, any>; touched: string[] },
    oldRequest: { data: Record<string, any>; touched: string[] },
  ) => {
    // Verify the data structure is correct
    const hasNewData = typeof newRequest.data === 'object' && newRequest.data !== null
    const hasNewTouched = Array.isArray(newRequest.touched)
    const hasOldData = typeof oldRequest.data === 'object' && oldRequest.data !== null
    const hasOldTouched = Array.isArray(oldRequest.touched)
    const hasNameField = 'name' in newRequest.data
    const touchedContainsName = newRequest.touched.includes('name')

    setDataCorrect(hasNewData && hasNewTouched && hasOldData && hasOldTouched && hasNameField && touchedContainsName)

    // Block validation if name is "block"
    if (newRequest.data.name === 'block') {
      setBlocked(true)
      return false
    }

    setBlocked(false)
    return true
  }

  return (
    <div>
      <h1>Precognition - onBeforeValidation</h1>

      <Form action="/form-component/precognition" method="post">
        {({ errors, invalid, validate, validating }) => (
          <>
            <div>
              <label htmlFor="name">Name:</label>
              <input
                id="name"
                name="name"
                onChange={(e) => {
                  validate('name', {
                    onBeforeValidation: handleBeforeValidation,
                  })
                }}
              />
              {invalid('name') && <p className="error">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email">Email:</label>
              <input id="email" name="email" onChange={() => validate('email')} />
              {invalid('email') && <p className="error">{errors.email}</p>}
            </div>

            {validating && <p className="validating">Validating...</p>}
            {blocked && <p className="blocked">Validation blocked by onBeforeValidation</p>}
            {dataCorrect && <p className="data-correct">Data structure is correct</p>}

            <button type="submit">Submit</button>
          </>
        )}
      </Form>
    </div>
  )
}
