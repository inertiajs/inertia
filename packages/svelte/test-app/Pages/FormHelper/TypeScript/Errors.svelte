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

$form.clearErrors('users.0.name')
$form.resetAndClearErrors('users.0.name')
$form.setError('name', 'Name is required')
$form.setError({ name: 'Name is required' })
$form.clearErrors('name')
$form.resetAndClearErrors('name')
// @ts-expect-error - A form has no email field
$form.setError({ email: 'Email is required' })

// Nested errors
$form.errors['company.name']
$form.setError('company.name', 'Company name is required')
$form.setError({ 'company.name': 'Company name is required' })
$form.clearErrors('company.name')
$form.resetAndClearErrors('company.name')
// @ts-expect-error - A company has no street field
$form.setError({ 'company.street': 'Company street is required' })

// Array errors
$form.errors['users.0.name']
$form.setError('users.0.name', 'User name is required')
$form.setError({ 'users.0.name': 'User name is required' })
$form.clearErrors('users.0.name')
$form.resetAndClearErrors('users.0.name')
$form.setError('users.0.name', 'User name is required')
// @ts-expect-error - A user has no email field
$form.setError({ 'users.0.email': 'User email is required' })
</script>