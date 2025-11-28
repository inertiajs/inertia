<script lang="ts">
  import { Form } from '@inertiajs/svelte'
</script>

<div>
  <h1>Precognition - Custom Headers</h1>

  <Form
    action="/precognition/headers"
    method="post"
    headers={{ 'X-Custom-Header': 'custom-value' }}
    validationTimeout={100}
    let:invalid
    let:errors
    let:validate
    let:validating
  >
    <div>
      <input name="name" placeholder="Name" on:blur={() => validate('name')} />
      {#if invalid('name')}
        <p>
          {errors.name}
        </p>
      {/if}
    </div>

    {#if validating}
      <p>Validating...</p>
    {/if}

    <button type="submit">Submit</button>
  </Form>
</div>
