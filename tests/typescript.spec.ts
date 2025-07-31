import test from '@playwright/test'
import reactUseForm from '../packages/react/src/useForm'
import vueUseForm from '../packages/vue3/src/useForm'

// TODO: Unify React/Vue tests while keeping TS safety
test.describe('TypeScript Support', () => {
  // @ts-expect-error
  const adapter = process.env.PACKAGE || 'vue3'
  test.skip(adapter === 'svelte', 'Skipping Svelte for now')

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

      if (adapter === 'react') {
        const form = reactUseForm<FormData>(defaultData)
        form.setData('name', 'John Doe')
        form.setData('users', [{ name: 'Jane Doe' }])
        // @ts-expect-error - A form has no email field
        form.setData('email', 'john@example.com')
        // @ts-expect-error - A form has no email field
        form.setData('users', [{ name: 'Jane Doe', email: 'jane@example.com' }])
      }

      if (adapter === 'vue3') {
        const form = vueUseForm<FormData>(defaultData)
        form.name = 'John Doe'
        form.users = [{ name: 'Jane Doe' }]
        // @ts-expect-error - A form has no email field
        form.email = 'john@example.com'
        // @ts-expect-error - A form has no email field
        form.users = [{ name: 'Jane Doe', email: 'jane@example.com' }]
      }
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

      if (adapter === 'react') {
        const form = reactUseForm<FormData>(defaultData)

        form.clearErrors('users.0.name')
        form.resetAndClearErrors('users.0.name')
        form.setError('users.0.name', 'User name is required')
      }

      if (adapter === 'vue3') {
        const form = vueUseForm<FormData>(defaultData)
        form.clearErrors('users.0.name')
        form.resetAndClearErrors('users.0.name')
        form.setError('users.0.name', 'User name is required')
      }
    })
  })
})
