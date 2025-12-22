<script lang="ts">
  import { Form } from '@inertiajs/svelte'

  let validateFilesEnabled = $state(false)
</script>

<div>
  <h1>Form Precognition Files</h1>

  <Form action="/precognition/files" method="post" validationTimeout={100} validateFiles={validateFilesEnabled}>
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

      <button type="button" onclick={() => (validateFilesEnabled = !validateFilesEnabled)}>
        Toggle Validate Files ({validateFilesEnabled ? 'enabled' : 'disabled'})
      </button>

      <button type="button" onclick={() => validate({ only: ['name', 'avatar'] })}>Validate Both</button>
    {/snippet}
  </Form>
</div>
