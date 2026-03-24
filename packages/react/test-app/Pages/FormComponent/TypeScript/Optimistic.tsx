// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { Form } from '@inertiajs/react'

interface UserForm {
  name: string
  email: string
}

export default () => {
  return (
    <div>
      <Form<UserForm>
        action="/users"
        method="post"
        optimistic={(props, formData) => {
          const name: string = formData.name
          const email: string = formData.email

          // @ts-expect-error - 'invalid_field' should not exist on UserForm
          console.log(formData.invalid_field)

          return { ...props, user: { name, email } }
        }}
        transform={(data) => {
          const name: string = data.name
          const email: string = data.email

          return { name, email }
        }}
      >
        <input name="name" />
        <input name="email" />
        <button type="submit">Submit</button>
      </Form>

      <Form
        action="/users"
        method="post"
        optimistic={(_props, formData) => {
          // Without a generic, formData is Record<string, FormDataConvertible>
          console.log(formData.anything)
        }}
      >
        <button type="submit">Submit</button>
      </Form>
    </div>
  )
}
