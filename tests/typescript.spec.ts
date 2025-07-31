import test from '@playwright/test'
import useForm from '../packages/vue3/src/useForm'

// TODO: Move to real test page/route
test.describe('TypeScript Support', () => {
  // @ts-expect-error
  test.skip(process.env.PACKAGE !== 'vue3', 'Only implemented for Vue 3')

  test.describe('Form Helper', () => {
    test('basic form data', async () => {
      type FormData = {
        name: string
        users: { name: string }[]
      }

      const defaultData = {
        name: '',
        users: [],
      }

      const form = useForm<FormData>(defaultData)
      form.name = 'John Doe'
      form.users = [{ name: 'Jane Doe' }]
      // @ts-expect-error - A form has no email field
      form.email = 'john@example.com'
      // @ts-expect-error - A form has no email field
      form.users = [{ name: 'Jane Doe', email: 'jane@example.com' }]
    })

    test('nested error access', async () => {
      type FormData = {
        name: string
        users: { name: string }[]
      }

      const defaultData = {
        name: '',
        users: [],
      }

      const form = useForm<FormData>(defaultData)
      form.clearErrors('users.0.name')
      form.resetAndClearErrors('users.0.name')
      form.setError('users.0.name', 'User name is required')
    })
  })
})
