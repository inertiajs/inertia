import { Form } from '@inertiajs/react'
import MethodsTestComponent from './MethodsTestComponent'

export default () => (
  <Form action="/dump/post" method="post">
    {({ isDirty, hasErrors, errors }) => (
      <>
        <div>
          <span>{String(isDirty)}</span>
          <span>{String(hasErrors)}</span>
          {hasErrors && <pre>{JSON.stringify(errors, null, 2)}</pre>}
        </div>

        <input type="text" name="name" defaultValue="Initial Name" />
        <input type="email" name="email" defaultValue="initial@example.com" />
        <textarea name="bio" defaultValue="Initial bio" />

        <MethodsTestComponent />
      </>
    )}
  </Form>
)
