<script lang="ts">
  import { useForm } from '@inertiajs/svelte'

  const form = useForm({
    name: '',
    email: '',
  })
    .withPrecognition('post', '/precognition/error-sync')
    .setValidationTimeout(100)

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    $form.submit()
  }
</script>

<div>
  <h1>Precognition Error Sync Test (Form Helper)</h1>

  <form on:submit={handleSubmit}>
    <div>
      <input bind:value={$form.name} name="name" placeholder="Name" on:blur={() => $form.validate('name')} />
      {#if $form.invalid('name')}
        <p id="name-error">
          {$form.errors.name}
        </p>
      {/if}
    </div>

    <div>
      <input bind:value={$form.email} name="email" placeholder="Email" on:blur={() => $form.validate('email')} />
      {#if $form.invalid('email')}
        <p id="email-error">
          {$form.errors.email}
        </p>
      {/if}
    </div>

    {#if $form.validating}<p id="validating">Validating...</p>{/if}

    <button type="submit" id="submit-btn">Submit</button>
  </form>
</div>
