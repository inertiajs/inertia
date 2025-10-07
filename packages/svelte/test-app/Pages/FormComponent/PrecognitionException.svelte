<script lang="ts">
  import { Form } from '@inertiajs/svelte'

  let exceptionCaught = false
  let exceptionMessage = ''

  const handleException = (error: Error) => {
    exceptionCaught = true
    exceptionMessage = error.message || 'Unknown error'
  }
</script>

<div>
  <h1>Precognition - onException</h1>

  <Form action="/form-component/precognition-exception" method="post" let:validate let:validating>
    {#if validating}
      <p class="validating">Validating...</p>
    {/if}
    {#if exceptionCaught}
      <p class="exception-caught">Exception caught: {exceptionMessage}</p>
    {/if}

    <div>
      <input id="name-input" name="name" />
    </div>

    <!-- This will trigger a validation request to a non-existent endpoint -->
    <button
      type="button"
      on:click={() =>
        validate('name', {
          onException: handleException,
        })}
    >
      Validate with Exception Handler
    </button>

    <button type="submit">Submit</button>
  </Form>
</div>
