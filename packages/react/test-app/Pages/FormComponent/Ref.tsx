import { FormComponentRef } from '@inertiajs/core'
import { Form } from '@inertiajs/react'
import { useRef } from 'react'

export default function Ref() {
  const formRef = useRef<FormComponentRef>(null)

  const submitProgrammatically = () => {
    formRef.current?.submit()
  }

  const resetForm = () => {
    formRef.current?.reset()
  }

  const resetNameField = () => {
    formRef.current?.reset('name')
  }

  const clearAllErrors = () => {
    formRef.current?.clearErrors()
  }

  const setTestError = () => {
    formRef.current?.setError('name', 'This is a test error')
  }

  const setCurrentAsDefaults = () => {
    formRef.current?.defaults()
  }

  const callPrecognitionMethods = () => {
    const validator = formRef.current?.validator()

    if (validator && !formRef.current?.touched('company') && !formRef.current?.valid('company')) {
      formRef.current?.validate({ only: ['company'] })
    }
  }

  return (
    <div>
      <h1>Form Ref Test</h1>

      <Form ref={formRef} action="/dump/post" method="post">
        {({ isDirty, hasErrors, errors }) => (
          <>
            {/* State display for testing */}
            <div>Form is {isDirty ? 'dirty' : 'clean'}</div>
            {hasErrors && <div>Form has errors</div>}
            {errors.name && <div id="error_name">{errors.name}</div>}

            <div>
              <input type="text" name="name" placeholder="Name" defaultValue="John Doe" />
            </div>

            <div>
              <input type="email" name="email" placeholder="Email" defaultValue="john@example.com" />
            </div>

            <div>
              <button type="submit">Submit via Form</button>
            </div>
          </>
        )}
      </Form>

      <div>
        <button onClick={submitProgrammatically}>Submit Programmatically</button>
        <button onClick={resetForm}>Reset Form</button>
        <button onClick={resetNameField}>Reset Name Field</button>
        <button onClick={clearAllErrors}>Clear Errors</button>
        <button onClick={setTestError}>Set Test Error</button>
        <button onClick={setCurrentAsDefaults}>Set Current as Defaults</button>
        <button onClick={callPrecognitionMethods}>Call Precognition Methods</button>
      </div>
    </div>
  )
}
