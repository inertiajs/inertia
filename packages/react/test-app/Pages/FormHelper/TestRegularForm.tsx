import { useForm } from '@inertiajs/react'

export default () => {
  const form = useForm({
    name: '',
    email: '',
  })

  // Test that regular form doesn't have precognition methods
  console.log('Regular form methods:', {
    hasWithPrecognition: typeof form.withPrecognition === 'function',
    hasValidate: typeof (form as any).validate === 'function',
    hasValid: typeof (form as any).valid === 'function',
    hasInvalid: typeof (form as any).invalid === 'function',
    hasValidating: 'validating' in form,
    hasTouched: typeof (form as any).touched === 'function',
  })

  const precognitiveForm = form.withPrecognition('post', '/test')

  // Test that precognitive form has all the methods
  console.log('Precognitive form methods:', {
    hasValidate: typeof precognitiveForm.validate === 'function',
    hasValid: typeof precognitiveForm.valid === 'function',
    hasInvalid: typeof precognitiveForm.invalid === 'function',
    hasValidating: 'validating' in precognitiveForm,
    hasTouched: typeof precognitiveForm.touched === 'function',
    hasSetValidationTimeout: typeof precognitiveForm.setValidationTimeout === 'function',
    hasWithFullErrors: typeof precognitiveForm.withFullErrors === 'function',
  })

  return (
    <div>
      <h1>Form Test Page</h1>
      <p>Check console for method availability test results</p>
    </div>
  )
}