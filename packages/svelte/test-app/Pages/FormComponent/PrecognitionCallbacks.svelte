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
          onPrecognitionSuccess: () => {
            successCalled = true
          },
          onFinish: () => {
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
          },
          onFinish: () => {
            finishCalled = true
          },
        })
      }}
    >
      Validate with onError
    </button>
  </Form>
</div>
