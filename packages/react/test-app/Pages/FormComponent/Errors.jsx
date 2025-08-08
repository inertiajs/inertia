import { useState } from 'react'
import { Form } from '@inertiajs/react'

export default () => {
  const [errorBag, setErrorBag] = useState(null)

  return (
    <Form
      action={errorBag ? '/form-component/errors/bag' : '/form-component/errors'}
      method="post"
      errorBag={errorBag}
    >
      {({ errors, hasErrors, setError, clearErrors }) => (
        <>
          <h1>Form Errors</h1>

          {hasErrors ? <div>Form has errors</div> : <div>No errors</div>}

          <div>
            <label htmlFor="name">Name</label>
            <input type="text" name="name" id="name" />
            <div id="error_name">{errors.name}</div>
          </div>

          <div>
            <label htmlFor="handle">Handle</label>
            <input type="text" name="handle" id="handle" />
            <div id="error_handle">{errors.handle}</div>
          </div>

          <div>
            <button
              type="button"
              onClick={() =>
                setError({
                  name: 'The name field is required.',
                  handle: 'The handle field is invalid.',
                })
              }
            >
              Set Errors
            </button>
            <button type="button" onClick={() => clearErrors()}>Clear Errors</button>
            <button type="button" onClick={() => clearErrors('name')}>Clear Name Error</button>
            <button type="button" onClick={() => setErrorBag('bag')}>Use Error Bag</button>
          </div>

          <button type="submit">Submit</button>
        </>
      )}
    </Form>
  )
}
