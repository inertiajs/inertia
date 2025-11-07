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
    <input name="name" bind:value={$form.name} placeholder="Name" on:blur={() => $form.touch('name')} />
    {#if $form.invalid('name')}
      <p>
        {$form.errors.name}
      </p>
    {/if}
  </div>

  <div>
    <input name="email" bind:value={$form.email} placeholder="Email" on:blur={() => $form.touch('email')} />
    {#if $form.invalid('email')}
      <p>
        {$form.errors.email}
      </p>
    {/if}
  </div>

  {#if $form.validating}<p>Validating...</p>{/if}

  <p id="name-touched">{$form.touched('name') ? 'Name is touched' : 'Name is not touched'}</p>
  <p id="email-touched">{$form.touched('email') ? 'Email is touched' : 'Email is not touched'}</p>
  <p id="any-touched">{$form.touched() ? 'Form has touched fields' : 'Form has no touched fields'}</p>

  <button type="button" on:click={() => $form.validate()}>Validate All Touched</button>
  <button type="button" on:click={() => $form.validate('name')}>Validate Name</button>
  <button type="button" on:click={() => $form.validate({ only: ['name', 'email'] })}>Validate Name and Email</button>
  <button type="button" on:click={() => $form.touch('name', 'email')}>Touch Name and Email</button>
  <button
    type="button"
    on:click={() => {
      $form.touch('name')
      $form.touch('name')
    }}
  >
    Touch Name Twice
  </button>
  <button type="button" on:click={() => $form.reset()}>Reset All</button>
  <button type="button" on:click={() => $form.reset('name')}>Reset Name</button>
  <button type="button" on:click={() => $form.reset('name', 'email')}>Reset Name and Email</button>
</div>
