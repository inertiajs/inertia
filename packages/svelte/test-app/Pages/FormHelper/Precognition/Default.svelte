<script lang="ts">
  import { useForm } from '@inertiajs/svelte'

  const form = useForm({
    name: '',
    email: '',
  })
    .withPrecognition('post', '/precognition/default')
    .setValidationTimeout(100)
</script>

<div>
  <div>
    <input bind:value={$form.name} name="name" placeholder="Name" on:blur={() => $form.validate('name')} />
    {#if $form.invalid('name')}
      <p>
        {$form.errors.name}
      </p>
    {/if}
    {#if $form.valid('name')}<p>Name is valid!</p>{/if}
  </div>

  <div>
    <input bind:value={$form.email} name="email" placeholder="Email" on:blur={() => $form.validate('email')} />
    {#if $form.invalid('email')}
      <p>
        {$form.errors.email}
      </p>
    {/if}
    {#if $form.valid('email')}<p>Email is valid!</p>{/if}
  </div>

  {#if $form.validating}<p>Validating...</p>{/if}
</div>
