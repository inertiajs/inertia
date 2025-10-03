import { Form } from '@inertiajs/react'
import { useState } from 'react'

export default () => {
  const [successCalled, setSuccessCalled] = useState(false)
  const [errorCalled, setErrorCalled] = useState(false)
  const [finishCalled, setFinishCalled] = useState(false)

  return (
    <div>
      <h1>Form Precognition Callbacks</h1>

      <Form action="/form-component/precognition" method="post" validateTimeout={100}>
        {({ validate, validating, touch }) => (
          <>
            {validating && <p>Validating...</p>}
            {successCalled && <p>onSuccess called!</p>}
            {errorCalled && <p>onError called!</p>}
            {finishCalled && <p>onFinish called!</p>}

            <div>
              <input name="name" onBlur={() => touch('name')} />
            </div>

            <button
              type="button"
              onClick={() => {
                setSuccessCalled(false)
                setErrorCalled(false)
                setFinishCalled(false)
                validate({
                  onSuccess: () => {
                    setSuccessCalled(true)
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
                  onError: () => {
                    setErrorCalled(true)
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
