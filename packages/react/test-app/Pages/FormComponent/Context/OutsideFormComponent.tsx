import { useFormContext } from '@inertiajs/react'

export default () => {
  const form = useFormContext()

  return form === undefined ? (
    <div id="no-context-message">Correctly returns undefined when used outside a Form component</div>
  ) : (
    <div id="unexpected-context">Unexpectedly has form context</div>
  )
}
