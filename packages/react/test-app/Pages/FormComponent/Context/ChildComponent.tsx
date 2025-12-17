import { useFormContext } from '@inertiajs/react'

export default ({ formId }: { formId?: string }) => {
  const form = useFormContext()

  return (
    <>
      {form ? (
        <div id={formId ? `${formId}-child-state` : 'child-state'}>
          <span>Child: Form is {form.isDirty ? 'dirty' : 'clean'}</span>
          {form.hasErrors && <span> | Child: Form has errors</span>}
          {form.errors.name && <span id={formId ? undefined : 'child_error_name'}> | Error: {form.errors.name}</span>}
        </div>
      ) : (
        <div id="child-no-context">No form context available</div>
      )}

      <button
        type="button"
        id={formId ? `${formId}-set-error` : 'child-set-error-button'}
        onClick={() => form?.setError('name', formId ? 'Error from child' : 'Error set from child component')}
      >
        Set Error
      </button>
      <button
        type="button"
        id={formId ? `${formId}-clear-error` : 'child-clear-errors-button'}
        onClick={() => form?.clearErrors('name')}
      >
        Clear Error
      </button>
      {!formId && (
        <>
          <button type="button" id="child-submit-button" onClick={() => form?.submit()}>
            Submit from Child
          </button>
          <button type="button" id="child-reset-button" onClick={() => form?.reset()}>
            Reset from Child
          </button>
          <button type="button" id="child-defaults-button" onClick={() => form?.defaults()}>
            Set Defaults
          </button>
        </>
      )}
    </>
  )
}
