import { useForm } from '@inertiajs/react'

export default () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form: any = useForm({
    document: {
      customer: { email: '' },
    },
  })
    .withPrecognition('post', '/precognition/transform-keys')
    .setValidationTimeout(100)

  form.transform((data: { document: { customer: { email: string } } }) => ({ ...data.document }))

  return (
    <div>
      <div>
        <input
          id="email-input"
          value={form.data.document.customer.email}
          name="customer.email"
          placeholder="Email"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setData('document.customer.email', e.target.value)}
          onBlur={() => form.validate('customer.email')}
        />
        {form.invalid('customer.email') && <p>{form.errors['customer.email']}</p>}
        {form.valid('customer.email') && <p>Email is valid!</p>}
      </div>

      {form.validating && <p>Validating...</p>}
    </div>
  )
}
