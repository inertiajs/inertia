<script lang="ts">
  import { Form } from '@inertiajs/svelte'
</script>

<div>
  <h1>Form Precognition Transform</h1>

  <Form
    action="/precognition/default"
    method="post"
    validationTimeout={100}
    transform={(data) => ({ name: String(data.name || '').repeat(2) })}
  >
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

      {#if validating}
        <p>Validating...</p>
      {/if}
    {/snippet}
  </Form>
</div>
