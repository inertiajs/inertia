import { Form } from '@inertiajs/react'
import ChildComponent from './ChildComponent'
import NestedComponent from './NestedComponent'
import OutsideFormComponent from './OutsideFormComponent'

export default () => (
  <>
    <Form action="/dump/post" method="post">
      {({ isDirty, hasErrors, errors }) => (
        <>
          <div>
            <span>Parent: Form is {isDirty ? 'dirty' : 'clean'}</span>
            {hasErrors && <span> | Parent: Form has errors</span>}
            {errors.name && <span> | {errors.name}</span>}
          </div>

          <input type="text" name="name" defaultValue="John Doe" />
          <input type="email" name="email" defaultValue="john@example.com" />

          <ChildComponent />
          <NestedComponent />
        </>
      )}
    </Form>

    <OutsideFormComponent />
  </>
)
