import test from '@playwright/test'
import useForm from '../packages/vue3/src/useForm'

// TODO: Move to real test page/route
test.describe('TypeScript Support', () => {
  // @ts-expect-error
  test.skip(process.env.PACKAGE !== 'vue3', 'Only implemented for Vue 3')

  test.describe('Form Helper', () => {
    test('data', async () => {
      type FormData = {
        name: string
        company: { name: string }
        users: { name: string }[]
      }

      const defaultData = {
        name: '',
        company: { name: '' },
        users: [],
      }

      const form = useForm<FormData>(defaultData)
      form.name = 'John Doe'
      form.company.name = 'Acme Corp'
      form.users = [{ name: 'Jane Doe' }]
      // @ts-expect-error - A form has no email field
      form.email = 'john@example.com'
      // @ts-expect-error - A company has no street field
      form.company.street = '123 Main St'
      // @ts-expect-error - A company has no street field
      form.company = { name: 'Acme Corp', street: '123 Main St' }
      // @ts-expect-error - A form has no email field
      form.users = [{ name: 'Jane Doe', email: 'jane@example.com' }]
    })

    test('errors', async () => {
      type FormData = {
        name: string
        company: { name: string }
        users: { name: string }[]
      }

      const defaultData = {
        name: '',
        company: { name: '' },
        users: [],
      }

      const form = useForm<FormData>(defaultData)

      // Single errors
      form.errors['name']
      form.setError('name', 'Name is required')
      form.setError({ name: 'Name is required' })
      form.clearErrors('name')
      form.resetAndClearErrors('name')
      // @ts-expect-error - A form has no email field
      form.setError({ email: 'Email is required' })

      // Nested errors
      form.errors['company.name']
      form.setError('company.name', 'Company name is required')
      form.setError({ 'company.name': 'Company name is required' })
      form.clearErrors('company.name')
      form.resetAndClearErrors('company.name')
      // @ts-expect-error - A company has no street field
      form.setError({ 'company.street': 'Company street is required' })

      // Array errors
      form.errors['users.0.name']
      form.setError('users.0.name', 'User name is required')
      form.setError({ 'users.0.name': 'User name is required' })
      form.clearErrors('users.0.name')
      form.resetAndClearErrors('users.0.name')
      form.setError('users.0.name', 'User name is required')
      // @ts-expect-error - A user has no email field
      form.setError({ 'users.0.email': 'User email is required' })
    })
  })
})
