<script lang="ts">
  import { Form } from '@inertiajs/svelte'
</script>

<div>
  <h1>Form Precognition Validate</h1>

  <Form
    action="/form-component/precognition"
    method="post"
    validateTimeout={100}
    let:invalid
    let:errors
    let:validate
    let:touch
    let:validating
  >
    {#if validating}
      <p>Validating...</p>
    {/if}

    <div>
      <input name="name" on:blur={() => touch('name')} />
      {#if invalid('name')}
        <p>{errors.name}</p>
      {/if}
    </div>

    <div>
      <input name="email" />
      {#if invalid('email')}
        <p>{errors.email}</p>
      {/if}
    </div>

    <button type="button" on:click={() => validate('name')}>Validate Name</button>
    <button type="button" on:click={() => validate(['name', 'email'])}>Validate Name and Email</button>
  </Form>
</div>
