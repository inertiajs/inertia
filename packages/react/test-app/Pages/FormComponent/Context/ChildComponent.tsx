import { useFormContext } from '@inertiajs/react'

export default function ChildComponent() {
  const form = useFormContext()

  const submitFromChild = () => {
    form?.submit()
  }

  const resetFromChild = () => {
    form?.reset()
  }

  const clearErrorsFromChild = () => {
    form?.clearErrors()
  }

  const setTestError = () => {
    form?.setError('name', 'Error set from child component')
  }

  const setDefaultsFromChild = () => {
    form?.defaults()
  }

  return (
    <div id="child-component" style={{ border: '2px solid blue', padding: '10px', margin: '10px 0' }}>
      <h3>Child Component (using useFormContext)</h3>

      {form ? (
        <div id="child-state">
          <div>
            Child: Form is <span>{form.isDirty ? 'dirty' : 'clean'}</span>
          </div>
          {form.hasErrors && <div>Child: Form has errors</div>}
          {form.processing && <div>Child: Form is processing</div>}
          {form.errors.name && <div id="child_error_name">Child Error: {form.errors.name}</div>}
          {form.wasSuccessful && <div id="child_was_successful">Child: Form was successful</div>}
          {form.recentlySuccessful && <div id="child_recently_successful">Child: Form recently successful</div>}
        </div>
      ) : (
        <div id="child-no-context">No form context available</div>
      )}

      <div style={{ marginTop: '10px' }}>
        <button type="button" onClick={submitFromChild} id="child-submit-button">
          Submit from Child
        </button>
        <button type="button" onClick={resetFromChild} id="child-reset-button">
          Reset from Child
        </button>
        <button type="button" onClick={clearErrorsFromChild} id="child-clear-errors-button">
          Clear Errors from Child
        </button>
        <button type="button" onClick={setTestError} id="child-set-error-button">
          Set Error from Child
        </button>
        <button type="button" onClick={setDefaultsFromChild} id="child-defaults-button">
          Set Defaults from Child
        </button>
      </div>
    </div>
  )
}
