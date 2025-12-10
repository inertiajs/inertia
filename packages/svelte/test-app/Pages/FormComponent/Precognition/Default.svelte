<script lang="ts">
  import { Form } from '@inertiajs/svelte'
</script>

<div>
  <h1>Form Precognition</h1>

  <Form
    action="/precognition/default"
    method="post"
    validationTimeout={100}
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

    <div>
      <input name="email" placeholder="Email" on:blur={() => validate('email')} />
      {#if invalid('email')}
        <p>{errors.email}</p>
      {/if}
      {#if valid('email')}
        <p>Email is valid!</p>
      {/if}
    </div>

    {#if validating}
      <p>Validating...</p>
    {/if}
  </Form>
</div>
