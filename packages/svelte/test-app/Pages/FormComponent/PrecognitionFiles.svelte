<script lang="ts">
  import { Form } from '@inertiajs/svelte'

  let validateFilesEnabled = false
</script>

<div>
  <h1>Form Precognition Files</h1>

  <Form
    action="/form-component/precognition-files"
    method="post"
    validateTimeout={100}
    validateFiles={validateFilesEnabled}
    let:invalid
    let:errors
    let:validate
    let:valid
    let:validating
    let:touch
  >
    {#if validating}
      <p>Validating...</p>
    {/if}

    <div>
      <input name="name" on:blur={() => validate('name')} />
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

    <button type="button" on:click={() => (validateFilesEnabled = !validateFilesEnabled)}>
      Toggle Validate Files ({validateFilesEnabled ? 'enabled' : 'disabled'})
    </button>

    <button type="button" on:click={() => validate(['name', 'avatar'])}>Validate Both</button>
  </Form>
</div>
