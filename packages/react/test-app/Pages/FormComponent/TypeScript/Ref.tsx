// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { FormComponentRef } from '@inertiajs/core'
import { Form } from '@inertiajs/react'
import { useRef } from 'react'

interface UserForm {
  name: string
  email: string
}

export default () => {
  const formRef = useRef<FormComponentRef<UserForm>>(null)

  return (
    <div>
      <Form<UserForm> action="/users" method="post" ref={formRef}>
        <input name="name" />
        <input name="email" />
        <button type="submit">Submit</button>
      </Form>

      <button onClick={() => formRef.current?.clearErrors('name')}>Clear name error</button>
      <button onClick={() => formRef.current?.reset('email')}>Reset email</button>

      {/* @ts-expect-error - 'invalid_field' should not be a valid key */}
      <button onClick={() => formRef.current?.clearErrors('invalid_field')}>Invalid</button>
    </div>
  )
}
