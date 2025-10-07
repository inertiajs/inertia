<script lang="ts">
  import { Form } from '@inertiajs/svelte'
</script>

<div>
  <h1>Precognition - Auto Cancel</h1>

  <Form
    action="/form-component/precognition"
    method="post"
    validateTimeout={2000}
    let:invalid
    let:errors
    let:validate
    let:validating
  >
    {#if validating}
      <p class="validating">Validating...</p>
    {/if}

    <div>
      <input id="name-input" name="name" on:blur={() => validate('name')} />
      {#if invalid('name')}
        <p class="error">
          {errors.name}
        </p>
      {/if}
    </div>

    <button type="submit">Submit</button>
  </Form>
</div>
