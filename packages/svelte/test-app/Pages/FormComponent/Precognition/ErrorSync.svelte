<script lang="ts">
  import { Form } from '@inertiajs/svelte'
</script>

<div>
  <h1>Precognition Error Sync Test</h1>

  <Form
    action="/precognition/error-sync"
    method="post"
    validationTimeout={100}
    let:invalid
    let:errors
    let:validate
    let:validating
  >
    <div>
      <input name="name" placeholder="Name" on:blur={() => validate('name')} />
      {#if invalid('name')}
        <p id="name-error">{errors.name}</p>
      {/if}
    </div>

    <div>
      <input name="email" placeholder="Email" on:blur={() => validate('email')} />
      {#if invalid('email')}
        <p id="email-error">{errors.email}</p>
      {/if}
    </div>

    {#if validating}
      <p id="validating">Validating...</p>
    {/if}

    <button type="submit" id="submit-btn">Submit</button>
  </Form>
</div>
