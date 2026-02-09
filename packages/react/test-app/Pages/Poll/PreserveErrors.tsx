import { useForm, usePage, usePoll } from '@inertiajs/react'

export default ({ time }: { time: number }) => {
  const { errors } = usePage().props as { errors?: { name?: string } }
  const form = useForm({ name: '' })

  const submit = () => {
    form.post('/poll/preserve-errors')
  }

  usePoll(300, {
    only: ['time'],
  })

  return (
    <>
      {errors?.name && <p id="page-error">{errors.name}</p>}
      {form.errors.name && <p id="form-error">{form.errors.name}</p>}

      <button type="button" onClick={submit}>
        Submit
      </button>

      <p id="time">Time: {time}</p>
    </>
  )
}
