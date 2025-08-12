<script>
  import { Form } from '@inertiajs/svelte'

  // Svelte Form component ref exposes only methods via bind:this
  let formRef

  function submitProgrammatically() {
    formRef.submit()
  }

  function resetForm() {
    formRef.reset()
  }

  function checkDirtyState() {
    // Since reactive slot values aren't accessible via bind:this,
    // we read from DOM elements that are updated by the slot
    const isDirtySpan = document.getElementById('current-dirty-state')
    const isDirty = isDirtySpan?.textContent === 'true'
    alert(`Form is dirty: ${isDirty}`)
  }

  function clearAllErrors() {
    formRef.clearErrors()
  }

  function setTestError() {
    formRef.setError('name', 'This is a test error')
  }

  function checkErrors() {
    // Since reactive slot values aren't accessible via bind:this,
    // we read from DOM elements that are updated by the slot
    const hasErrorsSpan = document.getElementById('current-has-errors')
    const errorsSpan = document.getElementById('current-errors')
    const hasErrors = hasErrorsSpan?.textContent === 'true'
    const errors = JSON.parse(errorsSpan?.textContent || '{}')
    alert(`Has errors: ${hasErrors}, Errors: ${JSON.stringify(errors)}`)
  }

</script>

<div>
  <h1>Form Ref Test</h1>

  <Form bind:this={formRef} action="/dump/post" method="post" let:isDirty let:errors let:hasErrors>
    <!-- Hidden spans to store current reactive state -->
    <span id="current-dirty-state" style="display: none;">{isDirty}</span>
    <span id="current-has-errors" style="display: none;">{hasErrors}</span>
    <span id="current-errors" style="display: none;">{JSON.stringify(errors)}</span>

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
    <button on:click={submitProgrammatically}>
      Submit Programmatically
    </button>
    <button on:click={resetForm}>
      Reset Form
    </button>
    <button on:click={checkDirtyState}>
      Check Dirty State
    </button>
    <button on:click={clearAllErrors}>
      Clear Errors
    </button>
    <button on:click={setTestError}>
      Set Test Error
    </button>
    <button on:click={checkErrors}>
      Check Errors
    </button>
  </div>
</div>