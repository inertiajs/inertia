<script lang="ts">
  import { Form } from '@inertiajs/svelte'

  let successCalled = false
  let errorCalled = false
  let finishCalled = false
  let exceptionCaught = false
  let exceptionMessage = ''

  const handleException = (error: Error) => {
    exceptionCaught = true
    exceptionMessage = error.message || 'Unknown error'
  }
</script>

<div>
  <h1>Form Precognition Callbacks &amp; Exceptions</h1>

  <h2>Callbacks Test</h2>
  <Form action="/form-component/precognition" method="post" validateTimeout={100} let:validate let:validating let:touch>
    <div>
      <input name="name" placeholder="Name" on:blur={() => touch('name')} />
    </div>

    {#if validating}
      <p>Validating...</p>
    {/if}
    {#if successCalled}
      <p>onSuccess called!</p>
    {/if}
    {#if errorCalled}
      <p>onError called!</p>
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
          onSuccess: () => {
            successCalled = true
            finishCalled = true
          },
        })
      }}
    >
      Validate with onSuccess
    </button>

    <button
      type="button"
      on:click={() => {
        successCalled = false
        errorCalled = false
        finishCalled = false
        validate({
          onError: () => {
            errorCalled = true
            finishCalled = true
          },
        })
      }}
    >
      Validate with onError
    </button>
  </Form>

  <hr />

  <h2>Exception Test</h2>
  <Form action="/form-component/precognition-exception" method="post" let:validate let:validating>
    <div>
      <input id="name-input" name="name" placeholder="Name" />
    </div>

    {#if validating}
      <p class="validating">Validating...</p>
    {/if}
    {#if exceptionCaught}
      <p class="exception-caught">Exception caught: {exceptionMessage}</p>
    {/if}

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
