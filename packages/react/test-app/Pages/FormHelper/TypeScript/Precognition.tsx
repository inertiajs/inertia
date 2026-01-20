// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { useForm } from '@inertiajs/react'

export default () => {
  const defaultForm = useForm({})
  const rememberForm = useForm('id', {})

  // @ts-expect-error - No Precognition...
  defaultForm.validate()
  // @ts-expect-error - No Precognition...
  rememberForm.validate()

  const precognitionForm = useForm({ name: '', company: '' }).withPrecognition('post', '/precognition/default')
  const originalPrecognitionForm = useForm('post', '/', {})

  precognitionForm.validate()
  originalPrecognitionForm.validate()

  precognitionForm.validate('name')
  precognitionForm.validate({ only: ['name'] })
  precognitionForm.touch('name')
  precognitionForm.touch('name', 'company')
  precognitionForm.touched()
  precognitionForm.touched('name')
  precognitionForm.invalid('name')
  precognitionForm.valid('name')

  // @ts-expect-error - Field does not exist
  precognitionForm.validate('email')
  // @ts-expect-error - Field does not exist
  precognitionForm.validate({ only: ['email'] })
  // @ts-expect-error - Field does not exist
  precognitionForm.touch('email')
  // @ts-expect-error - Field does not exist
  precognitionForm.touched('email')
  // @ts-expect-error - Field does not exist
  precognitionForm.invalid('email')
  // @ts-expect-error - Field does not exist
  precognitionForm.valid('email')

  const nestedForm = useForm({ user: { name: '', company: '' } }).withPrecognition('post', '/precognition/nested')

  nestedForm.validate('user.name')
  nestedForm.validate({ only: ['user.name'] })
  nestedForm.valid('user.name')
  nestedForm.invalid('user.name')

  // @ts-expect-error - Field does not exist
  nestedForm.validate('user.email')
  // @ts-expect-error - Field does not exist
  nestedForm.validate({ only: ['user.email'] })
  // @ts-expect-error - Field does not exist
  nestedForm.valid('user.email')
  // @ts-expect-error - Field does not exist
  nestedForm.invalid('user.email')
}
