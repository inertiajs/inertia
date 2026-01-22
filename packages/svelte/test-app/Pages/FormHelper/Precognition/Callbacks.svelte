<script lang="ts">
  import { useForm } from '@inertiajs/svelte'

  const form = useForm({
    name: '',
    email: '',
  })
    .withPrecognition('post', '/precognition/default')
    .setValidationTimeout(100)

  let successCalled = $state(false)
  let errorCalled = $state(false)
  let finishCalled = $state(false)
</script>

<div>
  <div>
    <input bind:value={form.name} name="name" placeholder="Name" onblur={() => form.touch('name')} />
    {#if form.invalid('name')}
      <p>
        {form.errors.name}
      </p>
    {/if}
    {#if form.valid('name')}<p>Name is valid!</p>{/if}
  </div>

  {#if form.validating}<p>Validating...</p>{/if}
  {#if successCalled}<p>onPrecognitionSuccess called!</p>{/if}
  {#if errorCalled}<p>onValidationError called!</p>{/if}
  {#if finishCalled}<p>onFinish called!</p>{/if}

  <button
    type="button"
    onclick={() => {
      successCalled = false
      errorCalled = false
      finishCalled = false
      form.validate({
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
</div>
