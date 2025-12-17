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
    return <div id="child-no-context">No form context available</div>
  }

  return (
    <>
      <span id="child-is-dirty">{String(form.isDirty)}</span>
      <span id="child-has-errors">{String(form.hasErrors)}</span>
      <span id="child-processing">{String(form.processing)}</span>
      <span id="child-was-successful">{String(form.wasSuccessful)}</span>
      <span id="child-recently-successful">{String(form.recentlySuccessful)}</span>
      {form.hasErrors && <pre id="child-errors">{JSON.stringify(form.errors, null, 2)}</pre>}

      <button type="button" id="child-submit" onClick={() => form.submit()}>
        submit()
      </button>
      <button type="button" id="child-reset-all" onClick={() => form.reset()}>
        reset()
      </button>
      <button type="button" id="child-reset-name" onClick={() => form.reset('name')}>
        reset('name')
      </button>
      <button type="button" id="child-reset-multiple" onClick={() => form.reset('name', 'email')}>
        reset('name', 'email')
      </button>

      <button type="button" id="child-clear-all-errors" onClick={() => form.clearErrors()}>
        clearErrors()
      </button>
      <button type="button" id="child-clear-name-error" onClick={() => form.clearErrors('name')}>
        clearErrors('name')
      </button>
      <button type="button" id="child-set-single-error" onClick={() => form.setError('name', 'Name is invalid')}>
        setError('name')
      </button>
      <button
        type="button"
        id="child-set-multiple-errors"
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

      <button type="button" id="child-reset-clear-all" onClick={() => form.resetAndClearErrors()}>
        resetAndClearErrors()
      </button>
      <button type="button" id="child-reset-clear-name" onClick={() => form.resetAndClearErrors('name')}>
        resetAndClearErrors('name')
      </button>
      <button type="button" id="child-set-defaults" onClick={() => form.defaults()}>
        defaults()
      </button>

      <button type="button" id="child-get-data" onClick={testGetData}>
        getData()
      </button>
      <button type="button" id="child-get-form-data" onClick={testGetFormData}>
        getFormData()
      </button>

      {getDataResult && (
        <div id="get-data-result">
          <pre>{getDataResult}</pre>
        </div>
      )}
      {getFormDataResult && (
        <div id="get-form-data-result">
          <pre>{getFormDataResult}</pre>
        </div>
      )}
    </>
  )
}
