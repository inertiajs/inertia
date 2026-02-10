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

  const form = useForm<FormData>(() => defaultData)
  $form.name = 'John Doe'
  $form.company.name = 'Acme Corp'
  $form.users = [{ name: 'Jane Doe' }]
  // @ts-expect-error - A form has no email field
  $form.email = 'john@example.com'
  // @ts-expect-error - A company has no street field
  $form.company.street = '123 Main St'
  // @ts-expect-error - A company has no street field
  $form.company = { name: 'Acme Corp', street: '123 Main St' }
  // @ts-expect-error - A form has no email field
  $form.users = [{ name: 'Jane Doe', email: 'jane@example.com' }]

  const inferredData = {
    name: '',
    company: { name: '' },
    users: [{ name: '' }],
  }

  const inferred = useForm(() => inferredData)
  $inferred.name = 'John Doe'
  $inferred.company.name = 'Acme Corp'
  $inferred.users = [{ name: 'Jane Doe' }]
  // @ts-expect-error - A form has no email field
  $inferred.email = 'john@example.com'

  const withRememberKey = useForm<FormData>('myKey', () => defaultData)
  $withRememberKey.name = 'John Doe'
  // @ts-expect-error - A form has no email field
  $withRememberKey.email = 'john@example.com'

  // @ts-expect-error - progress is a reserved form key
  const reservedViaCallback = useForm(() => ({ progress: 1 }))
</script>
