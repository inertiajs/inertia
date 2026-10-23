<script lang="ts">
  import { useForm } from '@inertiajs/svelte'

  const form = useForm({
    name: '',
    email: '',
  })
    .withPrecognition('query', '/precognition/default')
    .setValidationTimeout(100)
</script>

<div>
  <h1>Form Helper Precognition (QUERY)</h1>

  <div>
    <input bind:value={form.name} name="name" placeholder="Name" onblur={() => form.validate('name')} />
    {#if form.invalid('name')}
      <p>
        {form.errors.name}
      </p>
    {/if}
    {#if form.valid('name')}<p>Name is valid!</p>{/if}
  </div>

  <div>
    <input bind:value={form.email} name="email" placeholder="Email" onblur={() => form.validate('email')} />
    {#if form.invalid('email')}
      <p>
        {form.errors.email}
      </p>
    {/if}
    {#if form.valid('email')}<p>Email is valid!</p>{/if}
  </div>

  {#if form.validating}<p>Validating...</p>{/if}

  <button type="button" onclick={() => form.submit()}>Submit</button>
</div>
