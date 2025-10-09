<script lang="ts">
  import { Form } from '@inertiajs/svelte'
</script>

<div>
  <h1>Precognition - Manual Cancel</h1>

  <Form
    action="/form-component/precognition?slow=1"
    method="post"
    validateTimeout={5000}
    let:validate
    let:cancelValidation
    let:validating
  >
    {#if validating}
      <p class="validating">Validating...</p>
    {/if}

    <div>
      <input id="name-input" name="name" on:blur={() => validate('name')} />
    </div>

    <button type="button" on:click={() => cancelValidation()}>Cancel Validation</button>
    <button type="submit">Submit</button>
  </Form>
</div>
