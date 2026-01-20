<script lang="ts">
  import { isEqual } from 'lodash-es'
  import { Form } from '@inertiajs/svelte'

  const handleBeforeValidation = (
    newRequest: { data: Record<string, unknown> | null; touched: string[] },
    oldRequest: { data: Record<string, unknown> | null; touched: string[] },
  ) => {
    const payloadIsCorrect =
      isEqual(newRequest, { data: { name: 'block' }, touched: ['name'] }) &&
      isEqual(oldRequest, { data: {}, touched: [] })

    // Block validation if name is "block"
    if (payloadIsCorrect && newRequest.data?.name === 'block') {
      return false
    }

    return true
  }
</script>

<div>
  <h1>Precognition - onBefore</h1>

  <Form
    action="/precognition/default"
    method="post"
    let:errors
    let:invalid
    let:validate
    let:validating
    validationTimeout={100}
  >
    <div>
      <label for="name">Name:</label>
      <input
        id="name"
        name="name"
        on:change={() =>
          validate('name', {
            onBeforeValidation: handleBeforeValidation,
          })}
      />
      {#if invalid('name')}
        <p class="error">{errors.name}</p>
      {/if}
    </div>

    <div>
      <label for="email">Email:</label>
      <input id="email" name="email" on:change={() => validate('email')} />
      {#if invalid('email')}
        <p class="error">{errors.email}</p>
      {/if}
    </div>

    {#if validating}
      <p class="validating">Validating...</p>
    {/if}

    <button type="submit">Submit</button>
  </Form>
</div>
