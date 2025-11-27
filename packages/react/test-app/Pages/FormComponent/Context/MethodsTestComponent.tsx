import { useFormContext } from '@inertiajs/react'
import { useState } from 'react'

export default function MethodsTestComponent() {
  const form = useFormContext()

  // State for displaying method results
  const [getDataResult, setGetDataResult] = useState<string>('')
  const [getFormDataResult, setGetFormDataResult] = useState<string>('')

  const testSubmit = () => {
    form?.submit()
  }

  const testResetAll = () => {
    form?.reset()
  }

  const testResetName = () => {
    form?.reset('name')
  }

  const testResetMultiple = () => {
    form?.reset('name', 'email')
  }

  const testClearAllErrors = () => {
    form?.clearErrors()
  }

  const testClearNameError = () => {
    form?.clearErrors('name')
  }

  const testSetSingleError = () => {
    form?.setError('name', 'Name is invalid (set from child)')
  }

  const testSetMultipleErrors = () => {
    form?.setError({
      name: 'Name error from child',
      email: 'Email error from child',
      bio: 'Bio error from child',
    })
  }

  const testResetAndClearErrors = () => {
    form?.resetAndClearErrors()
  }

  const testResetAndClearNameError = () => {
    form?.resetAndClearErrors('name')
  }

  const testSetDefaults = () => {
    form?.defaults()
  }

  const testGetData = () => {
    if (form) {
      const data = form.getData()
      setGetDataResult(JSON.stringify(data, null, 2))
    }
  }

  const testGetFormData = () => {
    if (form) {
      const formData = form.getFormData()
      const obj: Record<string, any> = {}
      formData.forEach((value, key) => {
        obj[key] = value
      })
      setGetFormDataResult(JSON.stringify(obj, null, 2))
    }
  }

  return (
    <div id="methods-test-component" style={{ border: '2px solid orange', padding: '15px', margin: '15px 0' }}>
      <h3>Methods Test Component (using useFormContext)</h3>

      {form ? (
        <div id="child-methods-state">
          {/* Display current state */}
          <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0' }}>
            <h4>Current State from Context</h4>
            <ul>
              <li>
                isDirty: <span id="child-is-dirty">{String(form.isDirty)}</span>
              </li>
              <li>
                hasErrors: <span id="child-has-errors">{String(form.hasErrors)}</span>
              </li>
              <li>
                processing: <span id="child-processing">{String(form.processing)}</span>
              </li>
              <li>
                wasSuccessful: <span id="child-was-successful">{String(form.wasSuccessful)}</span>
              </li>
              <li>
                recentlySuccessful: <span id="child-recently-successful">{String(form.recentlySuccessful)}</span>
              </li>
              {form.hasErrors && (
                <li>
                  Errors:
                  <pre id="child-errors">{JSON.stringify(form.errors, null, 2)}</pre>
                </li>
              )}
            </ul>
          </div>

          {/* Submit and Reset Methods */}
          <div style={{ margin: '10px 0' }}>
            <h4>Submit & Reset</h4>
            <button type="button" onClick={testSubmit} id="child-submit">
              submit()
            </button>
            <button type="button" onClick={testResetAll} id="child-reset-all">
              reset()
            </button>
            <button type="button" onClick={testResetName} id="child-reset-name">
              reset('name')
            </button>
            <button type="button" onClick={testResetMultiple} id="child-reset-multiple">
              reset('name', 'email')
            </button>
          </div>

          {/* Error Methods */}
          <div style={{ margin: '10px 0' }}>
            <h4>Error Management</h4>
            <button type="button" onClick={testClearAllErrors} id="child-clear-all-errors">
              clearErrors()
            </button>
            <button type="button" onClick={testClearNameError} id="child-clear-name-error">
              clearErrors('name')
            </button>
            <button type="button" onClick={testSetSingleError} id="child-set-single-error">
              setError('name', 'error')
            </button>
            <button type="button" onClick={testSetMultipleErrors} id="child-set-multiple-errors">
              setError({'{...}'})
            </button>
          </div>

          {/* Combined Methods */}
          <div style={{ margin: '10px 0' }}>
            <h4>Combined Methods</h4>
            <button type="button" onClick={testResetAndClearErrors} id="child-reset-clear-all">
              resetAndClearErrors()
            </button>
            <button type="button" onClick={testResetAndClearNameError} id="child-reset-clear-name">
              resetAndClearErrors('name')
            </button>
            <button type="button" onClick={testSetDefaults} id="child-set-defaults">
              defaults()
            </button>
          </div>

          {/* Data Retrieval Methods */}
          <div style={{ margin: '10px 0' }}>
            <h4>Data Retrieval</h4>
            <button type="button" onClick={testGetData} id="child-get-data">
              getData()
            </button>
            <button type="button" onClick={testGetFormData} id="child-get-form-data">
              getFormData()
            </button>

            {getDataResult && (
              <div id="get-data-result" style={{ background: '#e8f5e9', padding: '5px', margin: '5px 0' }}>
                <strong>getData() result:</strong>
                <pre>{getDataResult}</pre>
              </div>
            )}

            {getFormDataResult && (
              <div id="get-form-data-result" style={{ background: '#e3f2fd', padding: '5px', margin: '5px 0' }}>
                <strong>getFormData() result:</strong>
                <pre>{getFormDataResult}</pre>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div id="child-no-context">⚠ No form context available</div>
      )}
    </div>
  )
}
