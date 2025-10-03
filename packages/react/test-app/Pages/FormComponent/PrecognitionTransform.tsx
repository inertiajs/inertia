import { Form } from '@inertiajs/react'

export default () => {
  return (
    <div>
      <h1>Form Precognition Transform</h1>

      <Form
        action="/form-component/precognition-transform"
        method="post"
        validateTimeout={100}
        transform={(data) => ({ name: String(data.name || '').toUpperCase() })}
      >
        {({ invalid, errors, validate, valid, validating }) => (
          <>
            {validating && <p>Validating...</p>}

            <div>
              <input name="name" onBlur={() => validate('name')} />
              {invalid('name') && <p>{errors.name}</p>}
              {valid('name') && <p>Name is valid!</p>}
            </div>
          </>
        )}
      </Form>
    </div>
  )
}
