import type { InertiaFormProps } from '@inertiajs/react'

interface ChildProps {
  form: InertiaFormProps<{
    name: string
    email?: string
  }>
}

export default function Child({ form }: ChildProps) {
  return (
    <div>
      <p>Name: {form.data.name}</p>
      <p>Email: {form.data.email}</p>
    </div>
  )
}