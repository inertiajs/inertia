// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { useForm } from '@inertiajs/react'

export default function Any() {
  const form = useForm<{ name: any }>({ name: null }) // eslint-disable-line @typescript-eslint/no-explicit-any

  form.setData('name', 0)
  form.setData('name', 'test')
  form.setData('name', true)
  form.setData('name', null)
  form.setData('name', {
    key: 'value',
  })
}
