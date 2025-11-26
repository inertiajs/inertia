<script lang="ts">
  // This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
  import { useForm } from '@inertiajs/svelte'

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

  // Get Errors
  console.log(form.errors.name)
  console.log(form.errors['company.name'])

  // Clear Errors
  form.clearErrors('name')
  form.clearErrors('company')
  form.clearErrors('company.name')
  form.clearErrors('users')
  form.clearErrors('users.0')
  form.clearErrors('users.0.name')

  // Reset and Clear Errors
  form.resetAndClearErrors('name')
  form.resetAndClearErrors('company')
  form.resetAndClearErrors('company.name')
  form.resetAndClearErrors('users')
  form.resetAndClearErrors('users.0')
  form.resetAndClearErrors('users.0.name')

  // Set error by key
  form.setError('name', 'Validation error')
  form.setError('company', 'Validation error')
  form.setError('company.name', 'Validation error')
  form.setError('users', 'Validation error')
  form.setError('users.0', 'Validation error')
  form.setError('users.0.name', 'Validation error')

  // Set error by object
  form.setError({ name: 'Validation error' })
  form.setError({ company: 'Validation error' })
  form.setError({ 'company.name': 'Validation error' })
  form.setError({ users: 'Validation error' })
  form.setError({ 'users.0': 'Validation error' })
  form.setError({ 'users.0.name': 'Validation error' })

  // @ts-expect-error - Form has no email field
  console.log(form.errors.email)
  // @ts-expect-error - Company has no email field
  console.log(form.errors['company.email'])

  // @ts-expect-error - Form has no email field
  form.clearErrors('email')
  // @ts-expect-error - Form has no email field
  form.resetAndClearErrors('email')
  // @ts-expect-error - Form has no email field
  form.setError('email', 'Validation error')
  // @ts-expect-error - Form has no email field
  form.setError({ email: 'Validation error' })

  // @ts-expect-error - Company has no email field
  form.clearErrors('company.email')
  // @ts-expect-error - Company has no email field
  form.resetAndClearErrors('company.email')
  // @ts-expect-error - Company has no email field
  form.setError('company.email', 'Validation error')
  // @ts-expect-error - Company has no email field
  form.setError({ 'company.email': 'Validation error' })

  // @ts-expect-error - A user has no email field
  form.clearErrors('users.0.email')
  // @ts-expect-error - A user has no email field
  form.resetAndClearErrors('users.0.email')
  // @ts-expect-error - A user has no email field
  form.setError('users.0.email', 'Validation error')
  // @ts-expect-error - A user has no email field
  form.setError({ 'users.0.email': 'Validation error' })
</script>
