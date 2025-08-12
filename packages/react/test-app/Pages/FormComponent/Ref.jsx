import { Form } from '@inertiajs/react'
import { useRef } from 'react'

export default function Ref() {
  const formRef = useRef(null)

  const submitProgrammatically = () => {
    formRef.current?.submit()
  }

  const resetForm = () => {
    formRef.current?.reset()
  }

  const checkDirtyState = () => {
    alert(`Form is dirty: ${formRef.current?.isDirty}`)
  }

  const clearAllErrors = () => {
    formRef.current?.clearErrors()
  }

  const setTestError = () => {
    formRef.current?.setError('name', 'This is a test error')
  }

  const checkErrors = () => {
    const hasErrors = formRef.current?.hasErrors
    const errors = formRef.current?.errors
    alert(`Has errors: ${hasErrors}, Errors: ${JSON.stringify(errors)}`)
  }

  return (
    <div>
      <h1>Form Ref Test</h1>

      <Form ref={formRef} action="/dump/post" method="post">
        <div>
          <input type="text" name="name" placeholder="Name" defaultValue="John Doe" />
        </div>

        <div>
          <input type="email" name="email" placeholder="Email" defaultValue="john@example.com" />
        </div>

        <div>
          <button type="submit">Submit via Form</button>
        </div>
      </Form>

      <div>
        <button onClick={submitProgrammatically}>
          Submit Programmatically
        </button>
        <button onClick={resetForm}>
          Reset Form
        </button>
        <button onClick={checkDirtyState}>
          Check Dirty State
        </button>
        <button onClick={clearAllErrors}>
          Clear Errors
        </button>
        <button onClick={setTestError}>
          Set Test Error
        </button>
        <button onClick={checkErrors}>
          Check Errors
        </button>
      </div>
    </div>
  )
}