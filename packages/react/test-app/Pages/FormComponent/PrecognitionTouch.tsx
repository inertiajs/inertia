import { Form } from '@inertiajs/react'

export default () => {
  return (
    <div>
      <h1>Form Precognition Touch</h1>

      <Form action="/form-component/precognition" method="post" validateTimeout={100}>
        {({ invalid, errors, validate, touch, validating }) => (
          <>
            {validating && <p>Validating...</p>}

            <div>
              <input name="name" onBlur={() => touch('name')} />
              {invalid('name') && <p>{errors.name}</p>}
            </div>

            <div>
              <input name="email" onBlur={() => touch('email')} />
              {invalid('email') && <p>{errors.email}</p>}
            </div>

            <button type="button" onClick={() => validate()}>
              Validate All Touched
            </button>
            <button type="button" onClick={() => touch(['name', 'email'])}>
              Touch Name and Email
            </button>
            <button
              type="button"
              onClick={() => {
                touch('name')
                touch('name')
              }}
            >
              Touch Name Twice
            </button>
          </>
        )}
      </Form>
    </div>
  )
}
