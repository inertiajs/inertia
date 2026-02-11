import { useHttp } from '@inertiajs/react'

interface ValidateResponse {
  success: boolean
}

export default () => {
  const simpleErrors = useHttp<{ name: string; email: string }, ValidateResponse>({
    name: '',
    email: '',
  })

  const allErrors = useHttp<{ name: string; email: string }, ValidateResponse>({
    name: '',
    email: '',
  }).withAllErrors()

  const submitSimple = async () => {
    try {
      await simpleErrors.post('/api/validate-multiple')
    } catch {
      // Errors are stored in form.errors
    }
  }

  const submitAll = async () => {
    try {
      await allErrors.post('/api/validate-multiple')
    } catch {
      // Errors are stored in form.errors
    }
  }

  return (
    <div>
      <h1>useHttp withAllErrors Test</h1>

      <section id="simple-errors">
        <h2>Simple Errors (default)</h2>
        <button onClick={submitSimple} id="simple-submit">
          Submit
        </button>
        {simpleErrors.hasErrors && <div id="simple-has-errors">Has errors</div>}
        {simpleErrors.errors.name && <div id="simple-name-error">Name: {simpleErrors.errors.name}</div>}
        {simpleErrors.errors.email && <div id="simple-email-error">Email: {simpleErrors.errors.email}</div>}
      </section>

      <section id="all-errors">
        <h2>All Errors (withAllErrors)</h2>
        <button onClick={submitAll} id="all-submit">
          Submit
        </button>
        {allErrors.hasErrors && <div id="all-has-errors">Has errors</div>}
        {allErrors.errors.name && <div id="all-name-error">Name: {allErrors.errors.name}</div>}
        {allErrors.errors.email && <div id="all-email-error">Email: {allErrors.errors.email}</div>}
      </section>
    </div>
  )
}
