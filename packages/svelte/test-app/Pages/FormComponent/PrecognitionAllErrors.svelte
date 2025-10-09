<script lang="ts">
  import { Form } from '@inertiajs/svelte'
</script>

<div>
  <h1>Form Precognition - All Errors</h1>

  <Form
    action="/form-component/precognition-array-errors"
    method="post"
    validateTimeout={100}
    simpleValidationErrors={false}
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
        <div>
          {#if Array.isArray(errors.name)}
            {#each errors.name as error, index}
              <p data-testid="name-error-{index}">{error}</p>
            {/each}
          {:else}
            <p data-testid="name-error-0">{errors.name}</p>
          {/if}
        </div>
      {/if}
      {#if valid('name')}
        <p>Name is valid!</p>
      {/if}
    </div>

    <div>
      <input name="email" on:blur={() => validate('email')} />
      {#if invalid('email')}
        <div>
          {#if Array.isArray(errors.email)}
            {#each errors.email as error, index}
              <p data-testid="email-error-{index}">{error}</p>
            {/each}
          {:else}
            <p data-testid="email-error-0">{errors.email}</p>
          {/if}
        </div>
      {/if}
      {#if valid('email')}
        <p>Email is valid!</p>
      {/if}
    </div>
  </Form>
</div>
