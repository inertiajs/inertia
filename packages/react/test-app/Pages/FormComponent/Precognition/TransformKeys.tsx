import { Form } from '@inertiajs/react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transformData = (data: Record<string, any>) => {
  const document = data.document || {}
  return document
}

export default () => {
  return (
    <div>
      <h1>Form Precognition Transform Keys</h1>

      <Form action="/precognition/transform-keys" method="post" validationTimeout={100} transform={transformData}>
        {({ invalid, errors, validate, valid, validating }) => (
          <>
            <div>
              <input
                id="email-input"
                name="document[customer][email]"
                placeholder="Email"
                onBlur={() => validate('customer.email')}
              />
              {invalid('customer.email') && <p>{errors['customer.email']}</p>}
              {valid('customer.email') && <p>Email is valid!</p>}
            </div>

            {validating && <p>Validating...</p>}
          </>
        )}
      </Form>
    </div>
  )
}
