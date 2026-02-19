// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { Form } from '@inertiajs/react'

interface UserForm {
  name: string
  email: string
}

export default () => {
  return (
    <Form<UserForm> action="/users" method="post">
      {({ errors, getData, clearErrors, reset, setError, valid, invalid }) => {
        const nameError = errors.name
        const emailError = errors.email

        // @ts-expect-error - 'invalid_field' should not be a valid key
        console.log(errors.invalid_field)

        const data: UserForm = getData()
        console.log(data.name, data.email)

        clearErrors('name')
        clearErrors('email')
        clearErrors('name', 'email')

        // @ts-expect-error - 'invalid_field' should not be a valid key
        clearErrors('invalid_field')

        reset('name')
        reset('email')

        // @ts-expect-error - 'invalid_field' should not be a valid key
        reset('invalid_field')

        setError('name', 'Name is required')
        setError('email', 'Email is invalid')
        setError({ name: 'Name is required', email: 'Email is invalid' })

        // @ts-expect-error - 'invalid_field' should not be a valid key
        setError('invalid_field', 'Error')
        // @ts-expect-error - 'invalid_field' should not be a valid key
        setError({ invalid_field: 'Error' })

        valid('name')
        // @ts-expect-error - 'invalid_field' should not be a valid key
        valid('invalid_field')

        invalid('email')
        // @ts-expect-error - 'invalid_field' should not be a valid key
        invalid('invalid_field')

        return (
          <div>
            <input name="name" />
            {nameError && <span>{nameError}</span>}
            <input name="email" />
            {emailError && <span>{emailError}</span>}
            <button type="submit">Submit</button>
          </div>
        )
      }}
    </Form>
  )
}
