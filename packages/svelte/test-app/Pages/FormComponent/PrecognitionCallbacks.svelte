<script lang="ts">
  import { Form } from '@inertiajs/svelte'

  let successCalled = false
  let errorCalled = false
  let finishCalled = false
</script>

<div>
  <h1>Form Precognition Callbacks</h1>

  <Form action="/form-component/precognition" method="post" validateTimeout={100} let:validate let:validating let:touch>
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

    <div>
      <input name="name" on:blur={() => touch('name')} />
    </div>

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
</div>
