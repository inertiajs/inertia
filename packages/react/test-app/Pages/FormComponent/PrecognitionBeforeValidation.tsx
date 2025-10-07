import { Form } from '@inertiajs/react'
import { isEqual } from 'lodash-es'

export default function PrecognitionBeforeValidation() {
  const handleBeforeValidation = (
    newRequest: { data: Record<string, any>; touched: string[] },
    oldRequest: { data: Record<string, any>; touched: string[] },
  ) => {
    const payloadIsCorrect =
      isEqual(newRequest, { data: { name: 'block' }, touched: ['name'] }) &&
      isEqual(oldRequest, { data: {}, touched: [] })

    if (payloadIsCorrect && newRequest.data.name === 'block') {
      return false
    }

    return true
  }

  return (
    <div>
      <h1>Precognition - onBeforeValidation</h1>

      <Form action="/form-component/precognition" method="post" validateTimeout={100}>
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

            <button type="submit">Submit</button>
          </>
        )}
      </Form>
    </div>
  )
}
