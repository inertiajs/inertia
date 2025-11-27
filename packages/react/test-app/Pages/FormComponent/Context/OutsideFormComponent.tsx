import { useFormContext } from '@inertiajs/react'

export default function OutsideFormComponent() {
  // This should return undefined since it's not inside a Form component
  const form = useFormContext()

  return (
    <div id="outside-form-component" style={{ border: '2px solid red', padding: '10px', margin: '10px 0' }}>
      <h4>Component Outside Form (testing no context)</h4>

      {form === undefined ? (
        <div id="no-context-message">✓ Correctly returns undefined when used outside a Form component</div>
      ) : (
        <div id="unexpected-context">⚠ Unexpectedly has form context!</div>
      )}
    </div>
  )
}
