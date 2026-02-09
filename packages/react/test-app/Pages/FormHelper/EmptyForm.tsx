import { useForm } from '@inertiajs/react'

interface FormData {
  name: string
  email: string
}

export default () => {
  const form = useForm<FormData>()

  const submit = () => {
    form.transform(() => ({
      name: 'John Doe',
      email: 'john@example.com',
    }))
    form.post('/dump/post')
  }

  return (
    <div>
      <button onClick={submit}>Submit</button>
    </div>
  )
}
