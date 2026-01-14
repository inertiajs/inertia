import { useForm } from '@inertiajs/react'
import { useState } from 'react'

export default () => {
  const form = useForm({
    name: '',
    email: '',
  })
    .withPrecognition('post', '/precognition/default')
    .setValidationTimeout(100)

  const [successCalled, setSuccessCalled] = useState(false)
  const [errorCalled, setErrorCalled] = useState(false)
  const [finishCalled, setFinishCalled] = useState(false)

  const handleValidate = () => {
    setSuccessCalled(false)
    setErrorCalled(false)
    setFinishCalled(false)
    form.validate({
      onPrecognitionSuccess: () => {
        setSuccessCalled(true)
      },
      onValidationError: () => {
        setErrorCalled(true)
      },
      onFinish: () => {
        setFinishCalled(true)
      },
    })
  }

  return (
    <div>
      <div>
        <input
          value={form.data.name}
          name="name"
          placeholder="Name"
          onChange={(e) => form.setData('name', e.target.value)}
          onBlur={() => form.touch('name')}
        />
        {form.invalid('name') && <p>{form.errors.name}</p>}
        {form.valid('name') && <p>Name is valid!</p>}
      </div>

      {form.validating && <p>Validating...</p>}
      {successCalled && <p>onPrecognitionSuccess called!</p>}
      {errorCalled && <p>onValidationError called!</p>}
      {finishCalled && <p>onFinish called!</p>}

      <button type="button" onClick={handleValidate}>
        Validate
      </button>
    </div>
  )
}
