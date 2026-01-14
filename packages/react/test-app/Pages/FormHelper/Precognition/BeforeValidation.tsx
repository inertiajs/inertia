import { useForm } from '@inertiajs/react'
import { isEqual } from 'lodash-es'

export default () => {
  const form = useForm({
    name: '',
    email: '',
  })
    .withPrecognition('post', '/precognition/default')
    .setValidationTimeout(100)

  const handleBeforeValidation = (
    newRequest: { data: Record<string, unknown> | null; touched: string[] },
    oldRequest: { data: Record<string, unknown> | null; touched: string[] },
  ) => {
    const payloadIsCorrect =
      isEqual(newRequest, { data: { name: 'block' }, touched: ['name'] }) &&
      isEqual(oldRequest, { data: {}, touched: [] })

    if (payloadIsCorrect && newRequest.data?.name === 'block') {
      return false
    }

    return true
  }

  return (
    <div>
      <div>
        <input
          value={form.data.name}
          name="name"
          placeholder="Name"
          onChange={(e) => form.setData('name', e.target.value)}
          onBlur={() =>
            form.validate('name', {
              onBeforeValidation: handleBeforeValidation,
            })
          }
        />
        {form.invalid('name') && <p>{form.errors.name}</p>}
        {form.valid('name') && <p>Name is valid!</p>}
      </div>

      <div>
        <input
          value={form.data.email}
          name="email"
          placeholder="Email"
          onChange={(e) => form.setData('email', e.target.value)}
          onBlur={() => form.validate('email')}
        />
        {form.invalid('email') && <p>{form.errors.email}</p>}
        {form.valid('email') && <p>Email is valid!</p>}
      </div>

      {form.validating && <p>Validating...</p>}
    </div>
  )
}
