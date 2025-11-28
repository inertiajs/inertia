<script lang="ts">
  import type { FormComponentMethods } from '@inertiajs/core'
  import { Form } from '@inertiajs/svelte'

  // Svelte Form component ref exposes only methods via bind:this
  let formRef: FormComponentMethods | null = null

  function submitProgrammatically() {
    formRef?.submit()
  }

  function resetNameField() {
    formRef?.reset('name')
  }

  function resetForm() {
    formRef?.reset()
  }

  function clearAllErrors() {
    formRef?.clearErrors()
  }

  function setTestError() {
    formRef?.setError('name', 'This is a test error')
  }

  function setCurrentAsDefaults() {
    formRef?.defaults()
  }

  function callPrecognitionMethods() {
    const validator = formRef?.validator()

    if (validator && !formRef?.touched('company') && !formRef?.valid('company')) {
      formRef?.validate({ only: ['company'] })
    }
  }
</script>

<div>
  <h1>Form Ref Test</h1>

  <Form bind:this={formRef} action="/dump/post" method="post" let:isDirty let:errors let:hasErrors>
    <!-- State display for testing -->
    <div>Form is {isDirty ? 'dirty' : 'clean'}</div>
    {#if hasErrors}
      <div>Form has errors</div>
    {/if}
    {#if errors.name}
      <div id="error_name">{errors.name}</div>
    {/if}

    <div>
      <input type="text" name="name" placeholder="Name" value="John Doe" />
    </div>

    <div>
      <input type="email" name="email" placeholder="Email" value="john@example.com" />
    </div>

    <div>
      <button type="submit">Submit via Form</button>
    </div>
  </Form>

  <div>
    <button on:click={submitProgrammatically}> Submit Programmatically </button>
    <button on:click={resetForm}> Reset Form </button>
    <button on:click={resetNameField}> Reset Name Field </button>
    <button on:click={clearAllErrors}> Clear Errors </button>
    <button on:click={setTestError}> Set Test Error </button>
    <button on:click={setCurrentAsDefaults}> Set Current as Defaults </button>
    <button on:click={callPrecognitionMethods}> Call Precognition Methods </button>
  </div>
</div>
