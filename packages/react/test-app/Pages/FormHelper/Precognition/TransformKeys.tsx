import { useForm } from '@inertiajs/react'

export default () => {
  const form = useForm({
    document: {
      customer: { email: '' },
    },
  })
    .withPrecognition('post', '/precognition/transform-keys')
    .setValidationTimeout(100)

  form.transform((data) => ({ ...data.document }))

  return (
    <div>
      <div>
        <input
          id="email-input"
          value={form.data.document.customer.email}
          name="customer.email"
          placeholder="Email"
          onChange={(e) => form.setData('document.customer.email', e.target.value)}
          onBlur={() => form.validate('customer.email' as any)}
        />
        {form.invalid('customer.email' as any) && <p>{(form.errors as any)['customer.email']}</p>}
        {form.valid('customer.email' as any) && <p>Email is valid!</p>}
      </div>

      {form.validating && <p>Validating...</p>}
    </div>
  )
}
