<script lang="ts">
  import { Form } from '@inertiajs/svelte'

  // Transform flattens the structure: { document: { customer: {...} } } -> { customer: {...} }
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
    let:invalid
    let:errors
    let:validate
    let:valid
    let:validating
  >
    <div>
      <input id="email-input" name="document[customer][email]" placeholder="Email" on:blur={() => validate('customer.email')} />
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
  </Form>
</div>
