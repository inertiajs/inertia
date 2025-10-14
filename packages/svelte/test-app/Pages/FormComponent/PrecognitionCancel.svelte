<script lang="ts">
  import { Form } from '@inertiajs/svelte'
</script>

<div>
  <h1>Precognition - Cancel Tests</h1>

  <h2>Auto Cancel Test</h2>
  <Form
    action="/form-component/precognition?slow=1"
    method="post"
    validateTimeout={100}
    let:invalid
    let:errors
    let:validate
    let:validating
  >
    <div>
      <input id="auto-cancel-name-input" name="name" placeholder="Name" on:blur={() => validate('name')} />
      {#if invalid('name')}
        <p class="error">
          {errors.name}
        </p>
      {/if}
    </div>

    {#if validating}
      <p class="validating">Validating...</p>
    {/if}

    <button type="submit">Submit</button>
  </Form>

  <hr />

  <h2>Manual Cancel Test</h2>
  <Form
    action="/form-component/precognition?slow=1"
    method="post"
    validateTimeout={5000}
    let:validate
    let:cancelValidation
    let:validating
  >
    <div>
      <input id="manual-cancel-name-input" name="name" placeholder="Name" on:blur={() => validate('name')} />
    </div>

    {#if validating}
      <p class="validating">Validating...</p>
    {/if}

    <button type="button" on:click={() => cancelValidation()}>Cancel Validation</button>
    <button type="submit">Submit</button>
  </Form>
</div>
