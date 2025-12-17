import { Form } from '@inertiajs/react'
import ChildComponent from './Context/ChildComponent'
import NestedComponent from './Context/NestedComponent'
import OutsideFormComponent from './Context/OutsideFormComponent'

export default () => (
  <>
    <Form action="/dump/post" method="post">
      {({ isDirty, hasErrors, errors }) => (
        <>
          <div id="parent-state">
            <span>Parent: Form is {isDirty ? 'dirty' : 'clean'}</span>
            {hasErrors && <span> | Parent: Form has errors</span>}
            {errors.name && <span id="parent_error_name"> | {errors.name}</span>}
          </div>

          <input type="text" name="name" id="name" defaultValue="John Doe" />
          <input type="email" name="email" id="email" defaultValue="john@example.com" />

          <ChildComponent />
          <NestedComponent />
        </>
      )}
    </Form>

    <OutsideFormComponent />
  </>
)
