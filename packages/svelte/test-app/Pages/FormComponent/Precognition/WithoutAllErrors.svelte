<script lang="ts">
  import { Form } from '@inertiajs/svelte'
</script>

<div>
  <h1>Form Precognition - Array Errors</h1>

  <Form action="/precognition/with-all-errors" method="post" validationTimeout={100}>
    {#snippet children({ invalid, errors, validate, valid, validating })}
      <div>
        <input name="name" placeholder="Name" onblur={() => validate('name')} />
        {#if invalid('name')}
          <p>{errors.name}</p>
        {/if}
        {#if valid('name')}
          <p>Name is valid!</p>
        {/if}
      </div>

      <div>
        <input name="email" placeholder="Email" onblur={() => validate('email')} />
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
    {/snippet}
  </Form>
</div>
