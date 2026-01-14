import { Form } from '@inertiajs/react'
import MethodsTestComponent from './MethodsTestComponent'

export default () => (
  <Form action="/form-component/context/methods" method="post">
    {({ errors }) => (
      <>
        {Object.keys(errors).length > 0 && <pre>{JSON.stringify(errors, null, 2)}</pre>}

        <input type="text" name="name" defaultValue="Initial Name" />
        <input type="email" name="email" defaultValue="initial@example.com" />
        <textarea name="bio" defaultValue="Initial bio" />

        <MethodsTestComponent />
      </>
    )}
  </Form>
)
