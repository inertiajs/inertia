<script lang="ts">
  import { Form } from '@inertiajs/svelte'

  let successCalled = $state(false)
  let errorCalled = $state(false)
  let finishCalled = $state(false)
</script>

<div>
  <h1>Form Precognition Callbacks</h1>

  <h2>Callbacks Test</h2>
  <Form action="/precognition/default" method="post" validationTimeout={100}>
    {#snippet children({ validate, validating, touch })}
      <div>
        <input name="name" placeholder="Name" onblur={() => touch('name')} />
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
        onclick={() => {
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
    {/snippet}
  </Form>
</div>
