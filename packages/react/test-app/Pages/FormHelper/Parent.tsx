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