import { Form } from '@inertiajs/react'
import ChildComponent from './Context/ChildComponent'
import NestedComponent from './Context/NestedComponent'
import OutsideFormComponent from './Context/OutsideFormComponent'

export default function Context() {
  return (
    <div>
      <h1>Form Context Test</h1>

      <Form action="/dump/post" method="post">
        {({ isDirty, hasErrors, errors, processing }) => (
          <>
            {/* Parent form state display */}
            <div id="parent-state">
              <div>
                Parent: Form is <span>{isDirty ? 'dirty' : 'clean'}</span>
              </div>
              {hasErrors && <div>Parent: Form has errors</div>}
              {processing && <div>Parent: Form is processing</div>}
              {errors.name && <div id="parent_error_name">Parent Error: {errors.name}</div>}
            </div>

            <div>
              <label htmlFor="name">Name</label>
              <input type="text" name="name" id="name" placeholder="Name" defaultValue="John Doe" />
            </div>

            <div>
              <label htmlFor="email">Email</label>
              <input type="email" name="email" id="email" placeholder="Email" defaultValue="john@example.com" />
            </div>

            <div>
              <button type="submit" id="submit-button">
                Submit via Form
              </button>
            </div>

            {/* Child component that uses useFormContext */}
            <ChildComponent />

            {/* Nested child component to test deep context propagation */}
            <NestedComponent />
          </>
        )}
      </Form>

      {/* Component outside the Form to test undefined context */}
      <OutsideFormComponent />

      <div>
        <h2>Instructions</h2>
        <p>
          This test demonstrates that child components can access the form context using useFormContext(). Both the
          parent form and child components should display the same form state.
        </p>
        <ul>
          <li>Child components inside the Form should have access to form state and methods</li>
          <li>Context should propagate through multiple levels of nesting</li>
          <li>Components outside the Form should receive undefined from useFormContext()</li>
        </ul>
      </div>
    </div>
  )
}
