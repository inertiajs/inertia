import { Form } from '@inertiajs/react'
import { useState } from 'react'

export default () => {
  const [successCalled, setSuccessCalled] = useState(false)
  const [errorCalled, setErrorCalled] = useState(false)
  const [finishCalled, setFinishCalled] = useState(false)

  return (
    <div>
      <h1>Form Precognition Callbacks &amp; Exceptions</h1>

      <h2>Callbacks Test</h2>
      <Form action="/form-component/precognition" method="post" validateTimeout={100}>
        {({ validate, validating, touch }) => (
          <>
            <div>
              <input name="name" placeholder="Name" onBlur={() => touch('name')} />
            </div>

            {validating && <p>Validating...</p>}
            {successCalled && <p>onSuccess called!</p>}
            {errorCalled && <p>onError called!</p>}
            {finishCalled && <p>onFinish called!</p>}

            <button
              type="button"
              onClick={() => {
                setSuccessCalled(false)
                setErrorCalled(false)
                setFinishCalled(false)
                validate({
                  onPrecognitionSuccess: () => {
                    setSuccessCalled(true)
                  },
                  onFinish: () => {
                    setFinishCalled(true)
                  },
                })
              }}
            >
              Validate with onSuccess
            </button>

            <button
              type="button"
              onClick={() => {
                setSuccessCalled(false)
                setErrorCalled(false)
                setFinishCalled(false)
                validate({
                  onValidationError: () => {
                    setErrorCalled(true)
                  },
                  onFinish: () => {
                    setFinishCalled(true)
                  },
                })
              }}
            >
              Validate with onError
            </button>
          </>
        )}
      </Form>
    </div>
  )
}
