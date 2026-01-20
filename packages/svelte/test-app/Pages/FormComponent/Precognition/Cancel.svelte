<script lang="ts">
  import { Form } from '@inertiajs/svelte'
</script>

<div>
  <h1>Precognition - Cancel Tests</h1>

  <h2>Auto Cancel Test</h2>
  <Form
    action="/precognition/default?slow=1"
    method="post"
    validationTimeout={100}
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
</div>
