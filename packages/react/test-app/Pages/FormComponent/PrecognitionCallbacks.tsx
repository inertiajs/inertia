import { Form } from '@inertiajs/react'
import { useState } from 'react'

export default () => {
  const [successCalled, setSuccessCalled] = useState(false)
  const [errorCalled, setErrorCalled] = useState(false)
  const [finishCalled, setFinishCalled] = useState(false)
  const [exceptionCaught, setExceptionCaught] = useState(false)
  const [exceptionMessage, setExceptionMessage] = useState('')

  const handleException = (error: Error) => {
    setExceptionCaught(true)
    setExceptionMessage(error.message || 'Unknown error')
  }

  return (
    <div>
      <h1>Form Precognition Callbacks &amp; Exceptions</h1>

      <h2>Callbacks Test</h2>
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

      <hr />

      <h2>Exception Test</h2>
      <Form action="/form-component/precognition-exception" method="post">
        {({ validate, validating }) => (
          <>
            {validating && <p className="validating">Validating...</p>}
            {exceptionCaught && <p className="exception-caught">Exception caught: {exceptionMessage}</p>}

            <div>
              <input id="name-input" name="name" />
            </div>

            {/* This will trigger a validation request to a non-existent endpoint */}
            <button
              type="button"
              onClick={() =>
                validate('name', {
                  onException: handleException,
                })
              }
            >
              Validate with Exception Handler
            </button>

            <button type="submit">Submit</button>
          </>
        )}
      </Form>
    </div>
  )
}
