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
        method="post"
        action="/form-component/types"
        resetOnSuccess={['name', 'email']}
        resetOnError={['name']}
        onSubmitComplete={({ reset }) => {
          reset('name')
          reset('email')
        }}
      >
        {({ errors, getData, clearErrors }) => {
          console.log(errors.name, errors.email)

          const data = getData()
          console.log(data.name, data.email)

          clearErrors('name', 'email')

          // @ts-expect-error - 'invalid_field' should not be a valid key
          clearErrors('invalid_field')

          return <div>Form content</div>
        }}
      </Form>

      <Form<UserForm> method="post" action="/form-component/types" resetOnSuccess={true} resetOnError={false}>
        {() => <div>Boolean reset</div>}
      </Form>

      <Form<UserForm>
        method="post"
        action="/form-component/types"
        // @ts-expect-error - 'invalid_field' should not be a valid key
        resetOnSuccess={['invalid_field']}
        // @ts-expect-error - 'another_invalid' should not be a valid key
        resetOnError={['another_invalid']}
      >
        {() => <div>Invalid fields</div>}
      </Form>
    </div>
  )
}
