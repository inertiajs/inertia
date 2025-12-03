import { useFormContext } from '@inertiajs/react'
import { useMemo } from 'react'

export default function DeeplyNestedComponent() {
  const form = useFormContext()

  // Test that we can use useMemo with the context
  const formData = useMemo(() => {
    if (!form) return null
    return form.getData()
  }, [form])

  const dataDisplay = useMemo(() => {
    if (!formData) return 'No data'
    return JSON.stringify(formData, null, 2)
  }, [formData])

  return (
    <div id="deeply-nested-component" style={{ border: '2px solid purple', padding: '10px', margin: '10px 0' }}>
      <h4>Deeply Nested Component (using useFormContext)</h4>

      {form ? (
        <div id="deeply-nested-state">
          <div>
            Deeply Nested: Form is <span>{form.isDirty ? 'dirty' : 'clean'}</span>
          </div>
          {form.hasErrors && <div>Deeply Nested: Form has errors ({Object.keys(form.errors).length})</div>}
          {form.processing && <div>Deeply Nested: Form is processing</div>}

          <details>
            <summary>Form Data (from getData())</summary>
            <pre id="form-data-display">{dataDisplay}</pre>
          </details>
        </div>
      ) : (
        <div id="deeply-nested-no-context">No form context available in deeply nested component</div>
      )}
    </div>
  )
}
