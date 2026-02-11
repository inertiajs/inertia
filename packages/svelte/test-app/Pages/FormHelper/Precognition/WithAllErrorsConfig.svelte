<script lang="ts">
  import { config, useForm } from '@inertiajs/svelte'

  // Set global config for withAllErrors (no .withAllErrors() call on the form)
  config.set('form.withAllErrors', true)

  const form = useForm({
    name: '',
    email: '',
  })
    .withPrecognition('post', '/precognition/with-all-errors')
    .setValidationTimeout(100)
</script>

<div>
  <div>
    <input bind:value={form.name} name="name" placeholder="Name" onblur={() => form.validate('name')} />
    {#if form.invalid('name')}
      <div>
        {#if Array.isArray(form.errors.name)}
          {#each form.errors.name as error, index (index)}
            <p id="name-error-{index}">{error}</p>
          {/each}
        {:else}
          <p id="name-error-0">{form.errors.name}</p>
        {/if}
      </div>
    {/if}
    {#if form.valid('name')}<p>Name is valid!</p>{/if}
  </div>

  <div>
    <input bind:value={form.email} name="email" placeholder="Email" onblur={() => form.validate('email')} />
    {#if form.invalid('email')}
      <div>
        {#if Array.isArray(form.errors.email)}
          {#each form.errors.email as error, index (index)}
            <p id="email-error-{index}">{error}</p>
          {/each}
        {:else}
          <p id="email-error-0">{form.errors.email}</p>
        {/if}
      </div>
    {/if}
    {#if form.valid('email')}<p>Email is valid!</p>{/if}
  </div>

  {#if form.validating}<p>Validating...</p>{/if}
</div>
