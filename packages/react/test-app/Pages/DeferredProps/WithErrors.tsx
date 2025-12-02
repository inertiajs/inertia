import { Deferred, useForm, usePage } from '@inertiajs/react'

const Foo = () => {
  const { foo } = usePage<{ foo?: { text: string } }>().props

  return <div id="foo">{foo?.text}</div>
}

export default () => {
  const { errors } = usePage<{ errors: { name?: string } }>().props
  const form = useForm({
    name: '',
  })

  const submit = () => {
    form.post('/deferred-props/with-errors')
  }

  return (
    <>
      <Deferred data="foo" fallback={<div>Loading foo...</div>}>
        <Foo />
      </Deferred>

      {errors?.name && <p id="page-error">{errors.name}</p>}
      {form.errors.name && <p id="form-error">{form.errors.name}</p>}

      <button type="button" onClick={submit}>
        Submit
      </button>
    </>
  )
}
