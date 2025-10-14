<script lang="ts">
  import { Form } from '@inertiajs/svelte'
</script>

<div>
  <h1>Form Precognition Transform</h1>

  <Form
    action="/form-component/precognition-transform"
    method="post"
    validateTimeout={100}
    transform={(data) => ({ name: String(data.name || '').toUpperCase() })}
    let:invalid
    let:errors
    let:validate
    let:valid
    let:validating
  >
    <div>
      <input name="name" placeholder="Name" on:blur={() => validate('name')} />
      {#if invalid('name')}
        <p>{errors.name}</p>
      {/if}
      {#if valid('name')}
        <p>Name is valid!</p>
      {/if}
    </div>

    {#if validating}
      <p>Validating...</p>
    {/if}
  </Form>
</div>
