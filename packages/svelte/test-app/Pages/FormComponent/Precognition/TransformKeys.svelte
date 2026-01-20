<script lang="ts">
  import { Form } from '@inertiajs/svelte'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformData = (data: Record<string, any>) => {
    const document = data.document || {}
    return document
  }
</script>

<div>
  <h1>Form Precognition Transform Keys</h1>

  <Form
    action="/precognition/transform-keys"
    method="post"
    validationTimeout={100}
    transform={transformData}
  >
    {#snippet children({ invalid, errors, validate, valid, validating })}
      <div>
        <input
          id="email-input"
          name="document[customer][email]"
          placeholder="Email"
          onblur={() => validate('customer.email')}
        />
        {#if invalid('customer.email')}
          <p>{errors['customer.email']}</p>
        {/if}
        {#if valid('customer.email')}
          <p>Email is valid!</p>
        {/if}
      </div>

      {#if validating}
        <p>Validating...</p>
      {/if}
    {/snippet}
  </Form>
</div>
