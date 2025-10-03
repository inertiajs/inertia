<script lang="ts">
  import { Form } from '@inertiajs/svelte'
</script>

<div>
  <h1>Form Precognition Reset</h1>

  <Form
    action="/form-component/precognition"
    method="post"
    validateTimeout={100}
    let:invalid
    let:errors
    let:validate
    let:touch
    let:validating
    let:reset
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
      <input name="email" on:blur={() => touch('email')} />
      {#if invalid('email')}
        <p>{errors.email}</p>
      {/if}
    </div>

    <button type="button" on:click={() => validate()}>Validate All Touched</button>
    <button type="button" on:click={() => reset()}>Reset All</button>
    <button type="button" on:click={() => reset('name')}>Reset Name</button>
    <button type="button" on:click={() => reset('name', 'email')}>Reset Name and Email</button>
  </Form>
</div>
