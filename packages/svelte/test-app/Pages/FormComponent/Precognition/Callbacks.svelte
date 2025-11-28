<script lang="ts">
  import { Form } from '@inertiajs/svelte'

  let successCalled = false
  let errorCalled = false
  let finishCalled = false
</script>

<div>
  <h1>Form Precognition Callbacks</h1>

  <h2>Callbacks Test</h2>
  <Form action="/precognition/default" method="post" validationTimeout={100} let:validate let:validating let:touch>
    <div>
      <input name="name" placeholder="Name" on:blur={() => touch('name')} />
    </div>

    {#if validating}
      <p>Validating...</p>
    {/if}
    {#if successCalled}
      <p>onPrecognitionSuccess called!</p>
    {/if}
    {#if errorCalled}
      <p>onValidationError called!</p>
    {/if}
    {#if finishCalled}
      <p>onFinish called!</p>
    {/if}

    <button
      type="button"
      on:click={() => {
        successCalled = false
        errorCalled = false
        finishCalled = false
        validate({
          onPrecognitionSuccess: () => {
            successCalled = true
          },
          onValidationError: () => {
            errorCalled = true
          },
          onFinish: () => {
            finishCalled = true
          },
        })
      }}
    >
      Validate
    </button>
  </Form>
</div>
