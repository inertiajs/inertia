<script lang="ts">
  import { Form } from '@inertiajs/svelte'
</script>

<div>
  <h1>Precognition - Custom Headers</h1>

  <Form
    action="/form-component/precognition-headers"
    method="post"
    headers={{ 'X-Custom-Header': 'custom-value' }}
    validateTimeout={100}
    let:invalid
    let:errors
    let:validate
    let:validating
  >
    {#if validating}
      <p>Validating...</p>
    {/if}

    <div>
      <input name="name" on:blur={() => validate('name')} />
      {#if invalid('name')}
        <p>
          {errors.name}
        </p>
      {/if}
    </div>

    <button type="submit">Submit</button>
  </Form>
</div>
