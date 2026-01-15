import { useForm, usePage, WhenVisible } from '@inertiajs/react'

export default ({ foo }: { foo?: string }) => {
  const { errors } = usePage().props as { errors?: { name?: string } }
  const form = useForm({ name: '' })

  const submit = () => {
    form.post('/when-visible/preserve-errors')
  }

  return (
    <>
      {errors?.name && <p id="page-error">{errors.name}</p>}
      {form.errors.name && <p id="form-error">{form.errors.name}</p>}

      <button type="button" onClick={submit}>
        Submit
      </button>

      <div style={{ height: '2000px' }}></div>

      <WhenVisible data="foo" fallback={<div id="loading">Loading foo...</div>}>
        <div id="foo">Foo: {foo}</div>
      </WhenVisible>
    </>
  )
}
