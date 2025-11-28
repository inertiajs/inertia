import { Form } from '@inertiajs/react'

export default () => {
  return (
    <div>
      <h1>Form Precognition Transform</h1>

      <Form
        action="/precognition/default"
        method="post"
        validationTimeout={100}
        transform={(data) => ({ name: String(data.name || '').repeat(2) })}
      >
        {({ invalid, errors, validate, valid, validating }) => (
          <>
            <div>
              <input name="name" placeholder="Name" onBlur={() => validate('name')} />
              {invalid('name') && <p>{errors.name}</p>}
              {valid('name') && <p>Name is valid!</p>}
            </div>

            {validating && <p>Validating...</p>}
          </>
        )}
      </Form>
    </div>
  )
}
