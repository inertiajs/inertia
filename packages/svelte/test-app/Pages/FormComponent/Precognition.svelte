<script lang="ts">
  import { Form } from '@inertiajs/svelte'
</script>

<div>
  <h1>Form Precognition</h1>

  <Form
    action="/form-component/precognition"
    method="post"
    validateTimeout={100}
    let:invalid
    let:errors
    let:validate
    let:valid
    let:validating
  >
    {#if validating}
      <p>Validating...</p>
    {/if}

    <div>
      <input name="name" on:blur={() => validate('name')} />
      {#if invalid('name')}
        <p>{errors.name}</p>
      {/if}
      {#if valid('name')}
        <p>Name is valid!</p>
      {/if}
    </div>

    <div>
      <input name="email" on:blur={() => validate('email')} />
      {#if invalid('email')}
        <p>{errors.email}</p>
      {/if}
      {#if valid('email')}
        <p>Email is valid!</p>
      {/if}
    </div>
  </Form>
</div>
