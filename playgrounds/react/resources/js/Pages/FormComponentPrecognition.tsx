import { FormComponentMethods } from '@inertiajs/core'
import { Form, Head } from '@inertiajs/react'
import { useState } from 'react'
import Layout from '../Components/Layout'

const FormComponentPrecognition = () => {
  const [callbacks, setCallbacks] = useState({
    success: false,
    error: false,
    finish: false,
  })

  const validateWithCallbacks = (validate: FormComponentMethods['validate']) => {
    setCallbacks({
      success: false,
      error: false,
      finish: false,
    })

    validate({
      onPrecognitionSuccess: () => setCallbacks((prev) => ({ ...prev, success: true })),
      onValidationError: () => setCallbacks((prev) => ({ ...prev, error: true })),
      onFinish: () => setCallbacks((prev) => ({ ...prev, finish: true })),
      onBeforeValidation: (newReq, oldReq) => {
        // Prevent validation if name is 'block'
        if (newReq.data?.name === 'block') {
          alert('Validation blocked by onBefore!')
          return false
        }
      },
    })
  }

  const [validateFiles, setValidateFiles] = useState(false)
  const [validationTimeout, setValidateTimeout] = useState(1500)

  return (
    <>
      <Head title="Precognition" />
      <h1 className="text-3xl">Form Precognition</h1>

      {/* Live Validation & File Uploads */}
      <div className="mt-6 max-w-2xl space-y-6">
        <div className="rounded border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-3 text-lg font-medium">Live Validation & File Uploads</h3>

          {/* Configuration Toggle */}
          <div className="mb-3 flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={validateFiles}
                onChange={(e) => setValidateFiles(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Enable file validation</span>
            </label>
            <div className="flex items-center gap-2">
              <label className="text-sm">Timeout:</label>
              <select
                value={validationTimeout}
                onChange={(e) => setValidateTimeout(Number(e.target.value))}
                className="rounded border px-2 py-1 text-sm"
              >
                <option value={500}>500ms</option>
                <option value={1000}>1000ms</option>
                <option value={1500}>1500ms</option>
                <option value={2000}>2000ms</option>
              </select>
            </div>
          </div>

          <Form
            action="/precognition/default"
            method="post"
            validateFiles={validateFiles}
            validationTimeout={validationTimeout}
            className="space-y-4"
          >
            {({ errors, invalid, valid, validate, validating }) => (
              <>
                <p className="text-sm text-blue-600">Validating: {validating ? ' Yes...' : ' No'}</p>

                <div>
                  <label htmlFor="name" className="block font-medium">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    placeholder="Enter your name (min 3 chars)"
                    onBlur={() => validate('name')}
                    className={`mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm ${
                      invalid('name') ? 'border-red-500' : valid('name') ? 'border-green-500' : ''
                    }`}
                  />
                  {invalid('name') && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  {valid('name') && <p className="mt-1 text-sm text-green-600">Valid!</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    onBlur={() => validate('email')}
                    className={`mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm ${
                      invalid('email') ? 'border-red-500' : valid('email') ? 'border-green-500' : ''
                    }`}
                  />
                  {invalid('email') && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  {valid('email') && <p className="mt-1 text-sm text-green-600">Valid!</p>}
                </div>

                <div>
                  <label htmlFor="avatar" className="block font-medium">
                    Avatar
                  </label>
                  <input
                    id="avatar"
                    name="avatar"
                    type="file"
                    onChange={() => validate('avatar')}
                    className={`mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm ${
                      invalid('avatar') ? 'border-red-500' : valid('avatar') ? 'border-green-500' : ''
                    }`}
                  />
                  {invalid('avatar') && <p className="mt-1 text-sm text-red-600">{errors.avatar}</p>}
                  {valid('avatar') && <p className="mt-1 text-sm text-green-600">Valid!</p>}
                  <p className="mt-1 text-xs text-gray-500">
                    Files are validated during precognitive requests when validateFiles is enabled
                  </p>
                </div>
              </>
            )}
          </Form>
        </div>

        {/* Touch & Reset Methods */}
        <div className="rounded border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-3 text-lg font-medium">Touch & Reset Methods</h3>

          <Form action="/precognition/default" method="post" className="space-y-4">
            {({ errors, invalid, validate, touch, touched, reset, validating }) => (
              <>
                <div>
                  <label htmlFor="name2" className="block font-medium">
                    Name
                  </label>
                  <input
                    id="name2"
                    name="name"
                    placeholder="Name"
                    onBlur={() => touch('name')}
                    className="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
                  />
                  {invalid('name') && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  <p className="mt-1 text-xs text-gray-500">Touched: {String(touched('name'))}</p>
                </div>

                <div>
                  <label htmlFor="email2" className="block font-medium">
                    Email
                  </label>
                  <input
                    id="email2"
                    name="email"
                    type="email"
                    placeholder="Email"
                    onBlur={() => touch('email')}
                    className="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
                  />
                  {invalid('email') && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  <p className="mt-1 text-xs text-gray-500">Touched: {String(touched('email'))}</p>
                </div>

                {validating && <p className="text-sm text-blue-600">Validating...</p>}

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => validate()}
                    className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white"
                  >
                    Validate
                  </button>
                  <button
                    type="button"
                    onClick={() => reset()}
                    className="rounded bg-gray-600 px-3 py-1.5 text-sm text-white"
                  >
                    Reset All
                  </button>
                  <button
                    type="button"
                    onClick={() => reset('name')}
                    className="rounded bg-gray-600 px-3 py-1.5 text-sm text-white"
                  >
                    Reset Name
                  </button>
                </div>

                <div className="rounded bg-gray-100 p-3 text-sm">
                  <strong>Status:</strong>
                  <ul className="mt-2 space-y-1 text-xs">
                    <li>Any field touched: {String(touched())}</li>
                    <li>Name touched: {String(touched('name'))}</li>
                    <li>Email touched: {String(touched('email'))}</li>
                  </ul>
                </div>
              </>
            )}
          </Form>
        </div>

        {/* Validation Callbacks */}
        <div className="rounded border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-3 text-lg font-medium">Validation Callbacks</h3>

          <Form action="/precognition/default" method="post" className="space-y-4">
            {({ errors, invalid, validate, touch, validating }) => (
              <>
                <div>
                  <label htmlFor="name3" className="block font-medium">
                    Name
                  </label>
                  <input
                    id="name3"
                    name="name"
                    placeholder="Enter 'block' to prevent validation"
                    onBlur={() => touch('name')}
                    className="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
                  />
                  {invalid('name') && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                {validating && <p className="text-sm text-blue-600">Validating...</p>}

                {(callbacks.success || callbacks.error || callbacks.finish) && (
                  <div className="rounded bg-gray-100 p-3">
                    {callbacks.success && <p className="text-sm text-green-600">onPrecognitionSuccess called!</p>}
                    {callbacks.error && <p className="text-sm text-red-600">onValidationError called!</p>}
                    {callbacks.finish && <p className="text-sm text-blue-600">onFinish called!</p>}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => validateWithCallbacks(validate)}
                    className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white"
                  >
                    Validate
                  </button>
                </div>
              </>
            )}
          </Form>
        </div>
      </div>
    </>
  )
}

FormComponentPrecognition.layout = (page) => <Layout children={page} />

export default FormComponentPrecognition
