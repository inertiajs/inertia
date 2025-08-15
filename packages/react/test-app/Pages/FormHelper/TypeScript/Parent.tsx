// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { useForm } from '@inertiajs/react'
import Child from './Child'

export default function Parent() {
  const form = useForm({
    name: 'foo',
    remember: false,
  })

  return (
    <div>
      <Child form={form} />
    </div>
  )
}