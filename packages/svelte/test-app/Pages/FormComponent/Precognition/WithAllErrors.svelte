<script lang="ts">
  import { Form } from '@inertiajs/svelte'
</script>

<div>
  <h1>Form Precognition - All Errors</h1>

  <Form
    action="/precognition/with-all-errors"
    method="post"
    validationTimeout={100}
    withAllErrors
    let:invalid
    let:errors
    let:validate
    let:valid
    let:validating
  >
    <div>
      <input name="name" placeholder="Name" on:blur={() => validate('name')} />
      {#if invalid('name')}
        <div>
          {#if Array.isArray(errors.name)}
            {#each errors.name as error, index (index)}
              <p id="name-error-{index}">{error}</p>
            {/each}
          {:else}
            <p id="name-error-0">{errors.name}</p>
          {/if}
        </div>
      {/if}
      {#if valid('name')}
        <p>Name is valid!</p>
      {/if}
    </div>

    <div>
      <input name="email" placeholder="Email" on:blur={() => validate('email')} />
      {#if invalid('email')}
        <div>
          {#if Array.isArray(errors.email)}
            {#each errors.email as error, index (index)}
              <p id="email-error-{index}">{error}</p>
            {/each}
          {:else}
            <p id="email-error-0">{errors.email}</p>
          {/if}
        </div>
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
