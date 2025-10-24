// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { useForm } from '@inertiajs/react'

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

export default function Data() {
  const form = useForm<FormData>(defaultData)
  form.data.name = 'John Doe'
  form.data.company.name = 'Acme Corp'
  form.data.users = [{ name: 'Jane Doe' }]
  // @ts-expect-error - A form has no email field
  form.data.email = 'john@example.com'
  // @ts-expect-error - A company has no street field
  form.data.company.street = '123 Main St'
  // @ts-expect-error - A company has no street field
  form.data.company = { name: 'Acme Corp', street: '123 Main St' }
  // @ts-expect-error - A form has no email field
  form.data.users = [{ name: 'Jane Doe', email: 'jane@example.com' }]

  return null
}
