import { Form } from '@inertiajs/react'
import { useState } from 'react'

export default () => {
  const [validateFilesEnabled, setValidateFilesEnabled] = useState(false)

  return (
    <div>
      <h1>Form Precognition Files</h1>

      <Form action="/precognition/files" method="post" validationTimeout={100} validateFiles={validateFilesEnabled}>
        {({ invalid, errors, validate, valid, validating }) => (
          <>
            <div>
              <input name="name" placeholder="Name" onBlur={() => validate('name')} />
              {invalid('name') && <p>{errors.name}</p>}
              {valid('name') && <p>Name is valid!</p>}
            </div>

            <div>
              <input type="file" name="avatar" id="avatar" />
              {invalid('avatar') && <p>{errors.avatar}</p>}
              {valid('avatar') && <p>Avatar is valid!</p>}
            </div>

            {validating && <p>Validating...</p>}

            <button type="button" onClick={() => setValidateFilesEnabled(!validateFilesEnabled)}>
              Toggle Validate Files ({validateFilesEnabled ? 'enabled' : 'disabled'})
            </button>

            <button type="button" onClick={() => validate({ only: ['name', 'avatar'] })}>
              Validate Both
            </button>
          </>
        )}
      </Form>
    </div>
  )
}
