import { useForm } from '@inertiajs/react'
import { useCallback, useEffect, useRef } from 'react'

export default () => {
  const form = useForm({ name: '' })
  const renderCount = useRef(0)

  renderCount.current++

  const submitForm = useCallback(() => {
    form.post('/form-helper/stable-reference', {
      preserveState: true,
    })
  }, [form])

  useEffect(() => {
    submitForm()
  }, [submitForm])

  return (
    <div>
      <h1>useForm Stable Reference Test</h1>
      <div id="render-count">Render count: {renderCount.current}</div>
      {form.recentlySuccessful && <div id="recently-successful">Recently successful</div>}
      {form.wasSuccessful && <div id="was-successful">Was successful</div>}
    </div>
  )
}
