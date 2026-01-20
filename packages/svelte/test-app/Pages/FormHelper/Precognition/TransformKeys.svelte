<script lang="ts">
  import { useForm } from '@inertiajs/svelte'

  const form = useForm({
    document: {
      customer: { email: '' },
    },
  })
    .withPrecognition('post', '/precognition/transform-keys')
    .setValidationTimeout(100)
    .transform((data) => ({ ...data.document }))
</script>

<div>
  <div>
    <input
      id="email-input"
      bind:value={$form.document.customer.email}
      name="customer.email"
      placeholder="Email"
      on:blur={() => $form.validate('customer.email')}
    />
    {#if $form.invalid('customer.email')}
      <p>
        {$form.errors['customer.email']}
      </p>
    {/if}
    {#if $form.valid('customer.email')}<p>Email is valid!</p>{/if}
  </div>

  {#if $form.validating}<p>Validating...</p>{/if}
</div>
