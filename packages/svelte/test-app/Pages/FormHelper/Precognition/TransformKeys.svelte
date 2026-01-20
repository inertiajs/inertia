<script lang="ts">
  import { useForm } from '@inertiajs/svelte'

  const form = useForm({
    document: {
      customer: { email: '' },
    },
  })
    .withPrecognition('post', '/precognition/transform-keys')
    .setValidationTimeout(100)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .transform((data) => ({ ...data.document })) as any
</script>

<div>
  <div>
    <input
      id="email-input"
      bind:value={form.document.customer.email}
      name="customer.email"
      placeholder="Email"
      onblur={() => form.validate('customer.email')}
    />
    {#if form.invalid('customer.email')}
      <p>{form.errors['customer.email']}</p>
    {/if}
    {#if form.valid('customer.email')}<p>Email is valid!</p>{/if}
  </div>

  {#if form.validating}<p>Validating...</p>{/if}
</div>
