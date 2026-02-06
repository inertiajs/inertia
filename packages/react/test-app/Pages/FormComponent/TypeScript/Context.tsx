// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { useFormContext } from '@inertiajs/react'

interface UserForm {
  name: string
  email: string
}

export default () => {
  const form = useFormContext<UserForm>()

  if (!form) {
    return null
  }

  form.clearErrors('name')
  form.reset('email')
  form.setError('name', 'Error')

  // @ts-expect-error - 'invalid_field' should not be a valid key
  form.clearErrors('invalid_field')

  const data = form.getData()
  console.log(data.name, data.email)

  // @ts-expect-error - 'invalid_field' should not be a valid key
  console.log(data.invalid_field)

  return <div>Context component</div>
}
