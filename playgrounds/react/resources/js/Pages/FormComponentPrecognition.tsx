import { FormComponentMethods } from '@inertiajs/core'
import { Form, Head } from '@inertiajs/react'
import { useState } from 'react'
import Layout from '../Components/Layout'

const FormComponentPrecognition = () => {
  const [validateFiles, setValidateFiles] = useState(false)
  const [validationTimeout, setValidationTimeout] = useState(1500)

  const [callbacks, setCallbacks] = useState({
    success: false,
    error: false,
    finish: false,
  })

  const validateWithCallbacks = (validate: FormComponentMethods['validate']) => {
    setCallbacks({ success: false, error: false, finish: false })

    validate({
      onPrecognitionSuccess: () => setCallbacks((prev) => ({ ...prev, success: true })),
      onValidationError: () => setCallbacks((prev) => ({ ...prev, error: true })),
      onFinish: () => setCallbacks((prev) => ({ ...prev, finish: true })),
      onBeforeValidation: (newReq) => {
        if (newReq.data?.name === 'block') {
          alert('Validation blocked by onBeforeValidation!')
          return false
        }
      },
    })
  }

  return (
    <>
      <Head title="Form Component Precognition" />
      <h1 className="text-3xl">Form Component Precognition</h1>

      <Form
        action="/form-component/precognition"
        method="post"
        validateFiles={validateFiles}
        validationTimeout={validationTimeout}
        className="mt-6 max-w-2xl space-y-6"
      >
        {({ errors, invalid, valid, validate, validating, touch, touched, processing }) => (
          <>
            {/* Status Display */}
            <div className="rounded border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-3 text-lg font-medium">Validation Status (slot props)</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  validating:{' '}
                  <span className={`font-mono ${validating ? 'text-blue-600' : 'text-gray-500'}`}>
                    {String(validating)}
                  </span>
                </div>
                <div>
                  processing:{' '}
                  <span className={`font-mono ${processing ? 'text-blue-600' : 'text-gray-500'}`}>
                    {String(processing)}
                  </span>
                </div>
                <div>
                  touched():{' '}
                  <span className={`font-mono ${touched() ? 'text-orange-600' : 'text-gray-500'}`}>
                    {String(touched())}
                  </span>
                </div>
                <div>
                  touched('name'):{' '}
                  <span className={`font-mono ${touched('name') ? 'text-orange-600' : 'text-gray-500'}`}>
                    {String(touched('name'))}
                  </span>
                </div>
                <div>
                  touched('email'):{' '}
                  <span className={`font-mono ${touched('email') ? 'text-orange-600' : 'text-gray-500'}`}>
                    {String(touched('email'))}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Name Input */}
              <div>
                <label className="block font-medium" htmlFor="name">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Enter your name (min 3 chars)"
                  onBlur={() => validate('name')}
                  className={`mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm ${
                    invalid('name') ? 'border-red-500' : valid('name') ? 'border-green-500' : ''
                  }`}
                />
                {invalid('name') && <div className="mt-1 text-sm text-red-600">{errors.name}</div>}
                {valid('name') && <div className="mt-1 text-sm text-green-600">Valid!</div>}
              </div>

              {/* Email Input */}
              <div>
                <label className="block font-medium" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Enter your email"
                  onBlur={() => validate('email')}
                  className={`mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm ${
                    invalid('email') ? 'border-red-500' : valid('email') ? 'border-green-500' : ''
                  }`}
                />
                {invalid('email') && <div className="mt-1 text-sm text-red-600">{errors.email}</div>}
                {valid('email') && <div className="mt-1 text-sm text-green-600">Valid!</div>}
              </div>

              {/* File Input */}
              <div>
                <label className="block font-medium" htmlFor="avatar">
                  Avatar
                </label>
                <input
                  type="file"
                  name="avatar"
                  id="avatar"
                  onChange={() => validate('avatar')}
                  className={`mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm ${
                    invalid('avatar') ? 'border-red-500' : valid('avatar') ? 'border-green-500' : ''
                  }`}
                />
                {invalid('avatar') && <div className="mt-1 text-sm text-red-600">{errors.avatar}</div>}
                {valid('avatar') && <div className="mt-1 text-sm text-green-600">Valid!</div>}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={processing}
                className="rounded bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
              >
                Submit
              </button>

              <button
                type="button"
                onClick={() => validate()}
                className="rounded border border-slate-300 px-4 py-2 hover:bg-slate-50"
              >
                Validate Touched
              </button>

              <button
                type="button"
                onClick={() => touch('name')}
                className="rounded border border-slate-300 px-4 py-2 hover:bg-slate-50"
              >
                Touch Name
              </button>

              <button
                type="button"
                onClick={() => validateWithCallbacks(validate)}
                className="rounded border border-slate-300 px-4 py-2 hover:bg-slate-50"
              >
                Validate with Callbacks
              </button>
            </div>

            {/* Callbacks Display */}
            <div className="rounded border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-3 text-lg font-medium">Validation Callbacks</h3>
              <p className="mb-3 text-sm text-gray-600">
                Enter "block" in the name field to test onBeforeValidation blocking.
              </p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  onPrecognitionSuccess:{' '}
                  <span className={`font-mono ${callbacks.success ? 'text-green-600' : 'text-gray-500'}`}>
                    {String(callbacks.success)}
                  </span>
                </div>
                <div>
                  onValidationError:{' '}
                  <span className={`font-mono ${callbacks.error ? 'text-red-600' : 'text-gray-500'}`}>
                    {String(callbacks.error)}
                  </span>
                </div>
                <div>
                  onFinish:{' '}
                  <span className={`font-mono ${callbacks.finish ? 'text-blue-600' : 'text-gray-500'}`}>
                    {String(callbacks.finish)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </Form>

      {/* Configuration */}
      <div className="mt-8 max-w-2xl space-y-4">
        <h2 className="text-2xl">Configuration</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded border border-gray-200 bg-gray-50 p-4">
            <div className="space-y-1 text-sm">
              <div>
                <strong>Validate Files:</strong> <code>{String(validateFiles)}</code>
              </div>
              <div>
                <strong>Validation Timeout:</strong> <code>{validationTimeout}ms</code>
              </div>
              <div>
                <strong>Method:</strong> <code>POST</code>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={validateFiles}
                  onChange={(e) => setValidateFiles(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Enable file validation</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium">Validation Timeout</label>
              <select
                value={validationTimeout}
                onChange={(e) => setValidationTimeout(Number(e.target.value))}
                className="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
              >
                <option value={500}>500ms</option>
                <option value={1000}>1000ms</option>
                <option value={1500}>1500ms</option>
                <option value={2000}>2000ms</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

FormComponentPrecognition.layout = (page) => <Layout children={page} />

export default FormComponentPrecognition
