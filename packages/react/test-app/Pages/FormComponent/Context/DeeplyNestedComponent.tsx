import { useFormContext } from '@inertiajs/react'

export default () => {
  const form = useFormContext()

  return form ? (
    <div id="deeply-nested-state">
      <span>Deeply Nested: Form is {form.isDirty ? 'dirty' : 'clean'}</span>
    </div>
  ) : (
    <div id="deeply-nested-no-context">No context</div>
  )
}
