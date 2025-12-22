<script lang="ts">
  import { Form } from '@inertiajs/svelte'

  let validateFilesEnabled = false
</script>

<div>
  <h1>Form Precognition Files</h1>

  <Form
    action="/precognition/files"
    method="post"
    validationTimeout={100}
    validateFiles={validateFilesEnabled}
    let:invalid
    let:errors
    let:validate
    let:valid
    let:validating
  >
    <div>
      <input name="name" placeholder="Name" on:blur={() => validate('name')} />
      {#if invalid('name')}
        <p>{errors.name}</p>
      {/if}
      {#if valid('name')}
        <p>Name is valid!</p>
      {/if}
    </div>

    <div>
      <input type="file" name="avatar" id="avatar" />
      {#if invalid('avatar')}
        <p>{errors.avatar}</p>
      {/if}
      {#if valid('avatar')}
        <p>Avatar is valid!</p>
      {/if}
    </div>

    {#if validating}
      <p>Validating...</p>
    {/if}

    <button type="button" on:click={() => (validateFilesEnabled = !validateFilesEnabled)}>
      Toggle Validate Files ({validateFilesEnabled ? 'enabled' : 'disabled'})
    </button>

    <button type="button" on:click={() => validate({ only: ['name', 'avatar'] })}>Validate Both</button>
  </Form>
</div>
