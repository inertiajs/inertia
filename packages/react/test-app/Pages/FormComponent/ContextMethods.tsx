import { Form } from '@inertiajs/react'
import MethodsTestComponent from './Context/MethodsTestComponent'

export default () => (
  <Form action="/dump/post" method="post">
    {({ isDirty, hasErrors, errors }) => (
      <>
        <div id="parent-state">
          <span id="parent-is-dirty">{String(isDirty)}</span>
          <span id="parent-has-errors">{String(hasErrors)}</span>
          {hasErrors && <pre id="parent-errors">{JSON.stringify(errors, null, 2)}</pre>}
        </div>

        <input type="text" name="name" id="name" defaultValue="Initial Name" />
        <input type="email" name="email" id="email" defaultValue="initial@example.com" />
        <textarea name="bio" id="bio" defaultValue="Initial bio" />

        <MethodsTestComponent />
      </>
    )}
  </Form>
)
