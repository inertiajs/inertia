import { useFormContext } from '@inertiajs/react'
import { useState } from 'react'

export default () => {
  const form = useFormContext()
  const [getDataResult, setGetDataResult] = useState('')
  const [getFormDataResult, setGetFormDataResult] = useState('')

  const testGetData = () => {
    if (form) {
      setGetDataResult(JSON.stringify(form.getData(), null, 2))
    }
  }

  const testGetFormData = () => {
    if (form) {
      const formData = form.getFormData()
      const obj: Record<string, FormDataEntryValue> = {}
      formData.forEach((value, key) => {
        obj[key] = value
      })
      setGetFormDataResult(JSON.stringify(obj, null, 2))
    }
  }

  if (!form) {
    return <div>No form context available</div>
  }

  return (
    <>
      <span>{String(form.isDirty)}</span>
      <span>{String(form.hasErrors)}</span>
      <span>{String(form.processing)}</span>
      <span>{String(form.wasSuccessful)}</span>
      <span>{String(form.recentlySuccessful)}</span>
      {form.hasErrors && <pre>{JSON.stringify(form.errors, null, 2)}</pre>}

      <button type="button" onClick={() => form.submit()}>
        submit()
      </button>
      <button type="button" onClick={() => form.reset()}>
        reset()
      </button>
      <button type="button" onClick={() => form.reset('name')}>
        reset('name')
      </button>
      <button type="button" onClick={() => form.reset('name', 'email')}>
        reset('name', 'email')
      </button>

      <button type="button" onClick={() => form.clearErrors()}>
        clearErrors()
      </button>
      <button type="button" onClick={() => form.clearErrors('name')}>
        clearErrors('name')
      </button>
      <button type="button" onClick={() => form.setError('name', 'Name is invalid')}>
        setError('name')
      </button>
      <button
        type="button"
        onClick={() =>
          form.setError({
            name: 'Name error from child',
            email: 'Email error from child',
            bio: 'Bio error from child',
          })
        }
      >
        setError({'{...}'})
      </button>

      <button type="button" onClick={() => form.resetAndClearErrors()}>
        resetAndClearErrors()
      </button>
      <button type="button" onClick={() => form.resetAndClearErrors('name')}>
        resetAndClearErrors('name')
      </button>
      <button type="button" onClick={() => form.defaults()}>
        defaults()
      </button>

      <button type="button" onClick={testGetData}>
        getData()
      </button>
      <button type="button" onClick={testGetFormData}>
        getFormData()
      </button>

      {getDataResult && (
        <div>
          <pre>{getDataResult}</pre>
        </div>
      )}
      {getFormDataResult && (
        <div>
          <pre>{getFormDataResult}</pre>
        </div>
      )}
    </>
  )
}
