import { Form, Head } from '@inertiajs/react'
import { useState } from 'react'

const FormComponent = () => {
  const [customHeaders, setCustomHeaders] = useState({ 'X-Custom-Header': 'Demo-Value' })
  const [errorBag, setErrorBag] = useState('custom-bag')

  return (
    <>
      <Head title="Form Component" />

      <h1 className="text-3xl">Form Component</h1>

      <Form
        action="/form-component"
        method="post"
        headers={customHeaders}
        errorBag={errorBag}
        options={{
          only: ['foo'],
          reset: ['bar'],
        }}
        transform={(data) => ({ ...data, demo: 'data' })}
        className="mt-6 max-w-2xl space-y-6"
      >
        {({
          errors,
          hasErrors,
          processing,
          progress,
          wasSuccessful,
          recentlySuccessful,
          setError,
          clearErrors,
          isDirty,
          reset,
          submit,
        }) => (
          <>
            <div className="rounded border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-3 text-lg font-medium">Form Status (slot props)</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  isDirty:{' '}
                  <span className={`font-mono ${isDirty ? 'text-orange-600' : 'text-gray-500'}`}>
                    {String(isDirty)}
                  </span>
                </div>
                <div>
                  hasErrors:{' '}
                  <span className={`font-mono ${hasErrors ? 'text-red-600' : 'text-gray-500'}`}>
                    {String(hasErrors)}
                  </span>
                </div>
                <div>
                  processing:{' '}
                  <span className={`font-mono ${processing ? 'text-blue-600' : 'text-gray-500'}`}>
                    {String(processing)}
                  </span>
                </div>
                <div>
                  wasSuccessful:{' '}
                  <span className={`font-mono ${wasSuccessful ? 'text-green-600' : 'text-gray-500'}`}>
                    {String(wasSuccessful)}
                  </span>
                </div>
                <div>
                  recentlySuccessful:{' '}
                  <span className={`font-mono ${recentlySuccessful ? 'text-green-600' : 'text-gray-500'}`}>
                    {String(recentlySuccessful)}
                  </span>
                </div>
                {progress && (
                  <div>
                    progress: <span className="font-mono text-blue-600">{Math.round(progress.percentage)}%</span>
                  </div>
                )}
              </div>
            </div>

            {isDirty && (
              <div className="rounded border border-amber-100 bg-amber-50 p-3 text-amber-800">
                There are unsaved changes!
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block font-medium" htmlFor="name">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Enter your name"
                  className={`mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && <div className="mt-1 text-sm text-red-600">{errors.name}</div>}
              </div>

              <div>
                <label className="block font-medium" htmlFor="avatar">
                  Avatar
                </label>
                <input
                  type="file"
                  name="avatar"
                  id="avatar"
                  className="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
                />
                {errors.avatar && <div className="mt-1 text-sm text-red-600">{errors.avatar}</div>}
              </div>

              <div>
                <label className="block font-medium" htmlFor="skills">
                  Skills (Multiple)
                </label>
                <select
                  name="skills[]"
                  id="skills"
                  multiple
                  className="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
                  defaultValue={[]}
                >
                  <option value="vue">Vue.js</option>
                  <option value="react">React</option>
                  <option value="laravel">Laravel</option>
                  <option value="tailwind">Tailwind CSS</option>
                </select>
                {errors.skills && <div className="mt-1 text-sm text-red-600">{errors.skills}</div>}
              </div>

              <div>
                <label className="block font-medium">Tags</label>
                <div className="mt-1 space-y-2">
                  <input
                    type="text"
                    name="tags[]"
                    placeholder="Tag 1"
                    className="w-full appearance-none rounded border px-2 py-1 shadow-sm"
                  />
                  {errors['tags.0'] && <div className="text-sm text-red-600">{errors['tags.0']}</div>}
                  <input
                    type="text"
                    name="tags[]"
                    placeholder="Tag 2"
                    className="w-full appearance-none rounded border px-2 py-1 shadow-sm"
                  />
                  {errors['tags.1'] && <div className="text-sm text-red-600">{errors['tags.1']}</div>}
                </div>
              </div>

              <div>
                <label className="block font-medium">Address</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="user[address][street]"
                    placeholder="Street"
                    className="appearance-none rounded border px-2 py-1 shadow-sm"
                  />
                  <input
                    type="text"
                    name="user[address][city]"
                    placeholder="City"
                    className="appearance-none rounded border px-2 py-1 shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={processing}
                className="rounded bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
              >
                Submit
              </button>

              <button type="button" onClick={reset} className="rounded bg-gray-500 px-4 py-2 text-white">
                Reset
              </button>

              <button
                type="button"
                onClick={() => setError({ name: 'Name is required', avatar: 'Please select a file' })}
                className="rounded bg-red-500 px-4 py-2 text-white"
              >
                Set Errors
              </button>

              <button type="button" onClick={() => clearErrors()} className="rounded bg-green-500 px-4 py-2 text-white">
                Clear Errors
              </button>
            </div>
          </>
        )}
      </Form>

      <div className="mt-8 max-w-2xl space-y-4">
        <h2 className="text-2xl">Form Configuration</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-1 rounded border border-gray-200 bg-gray-50 p-4 text-sm">
            <div>
              <strong>Headers:</strong> <code className="text-xs">{JSON.stringify(customHeaders)}</code>
            </div>
            <div>
              <strong>Error Bag:</strong> <code>{errorBag}</code>
            </div>
            <div>
              <strong>Only:</strong> <code>['foo']</code>
            </div>
            <div>
              <strong>Reset:</strong> <code>['bar']</code>
            </div>
            <div>
              <strong>Method:</strong> <code>POST</code>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium">Error Bag</label>
              <input
                type="text"
                value={errorBag}
                onChange={(e) => setErrorBag(e.target.value)}
                className="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
                placeholder="Error bag name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Custom Header Value</label>
              <input
                type="text"
                value={customHeaders['X-Custom-Header']}
                onChange={(e) => setCustomHeaders({ 'X-Custom-Header': e.target.value })}
                className="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
                placeholder="Header value"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default FormComponent
