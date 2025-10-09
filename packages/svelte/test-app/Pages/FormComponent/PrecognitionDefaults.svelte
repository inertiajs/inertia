<script lang="ts">
  import { Form } from '@inertiajs/svelte'

  let formRef: any

  const handleSetDefaults = () => {
    formRef?.defaults()
  }
</script>

<div>
  <h1>Precognition - Defaults Updates Validator</h1>

  <Form
    bind:this={formRef}
    action="/form-component/precognition"
    method="post"
    validateTimeout={100}
    let:invalid
    let:errors
    let:validate
    let:validating
  >
    {#if validating}
      <p class="validating">Validating...</p>
    {/if}

    <div>
      <input id="name-input" name="name" />
      {#if invalid('name')}
        <p class="error">
          {errors.name}
        </p>
      {/if}
    </div>

    <button type="button" on:click={handleSetDefaults}>Set Defaults</button>
    <button type="button" on:click={() => validate('name')}>Validate Name</button>
    <button type="submit">Submit</button>
  </Form>
</div>
