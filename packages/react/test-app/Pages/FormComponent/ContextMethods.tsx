import { Form } from '@inertiajs/react'
import MethodsTestComponent from './Context/MethodsTestComponent'

export default function ContextMethods() {
  return (
    <div>
      <h1>Form Context Methods Test</h1>

      <Form action="/dump/post" method="post">
        {({ isDirty, hasErrors, errors, processing, wasSuccessful, recentlySuccessful }) => (
          <>
            {/* Parent form state display */}
            <div id="parent-state">
              <h3>Parent State (from slot props)</h3>
              <ul>
                <li>
                  isDirty: <span id="parent-is-dirty">{String(isDirty)}</span>
                </li>
                <li>
                  hasErrors: <span id="parent-has-errors">{String(hasErrors)}</span>
                </li>
                <li>
                  processing: <span id="parent-processing">{String(processing)}</span>
                </li>
                <li>
                  wasSuccessful: <span id="parent-was-successful">{String(wasSuccessful)}</span>
                </li>
                <li>
                  recentlySuccessful: <span id="parent-recently-successful">{String(recentlySuccessful)}</span>
                </li>
                {hasErrors && (
                  <li>
                    Errors:
                    <pre id="parent-errors">{JSON.stringify(errors, null, 2)}</pre>
                  </li>
                )}
              </ul>
            </div>

            <div>
              <label htmlFor="name">Name</label>
              <input type="text" name="name" id="name" placeholder="Name" defaultValue="Initial Name" />
            </div>

            <div>
              <label htmlFor="email">Email</label>
              <input type="email" name="email" id="email" placeholder="Email" defaultValue="initial@example.com" />
            </div>

            <div>
              <label htmlFor="bio">Bio</label>
              <textarea name="bio" id="bio" placeholder="Bio" defaultValue="Initial bio" />
            </div>

            <div>
              <button type="submit" id="submit-button">
                Submit
              </button>
            </div>

            {/* Child component that tests all methods through context */}
            <MethodsTestComponent />
          </>
        )}
      </Form>

      <div>
        <h2>Test Coverage</h2>
        <p>This test verifies that all form methods are accessible through useFormContext():</p>
        <ul>
          <li>
            <code>submit()</code> - Submit the form programmatically
          </li>
          <li>
            <code>reset()</code> - Reset all or specific fields
          </li>
          <li>
            <code>resetAndClearErrors()</code> - Reset fields and clear errors
          </li>
          <li>
            <code>clearErrors()</code> - Clear all or specific errors
          </li>
          <li>
            <code>setError()</code> - Set errors programmatically
          </li>
          <li>
            <code>defaults()</code> - Set current values as defaults
          </li>
          <li>
            <code>getData()</code> - Get form data as an object
          </li>
          <li>
            <code>getFormData()</code> - Get form data as FormData
          </li>
        </ul>
      </div>
    </div>
  )
}
