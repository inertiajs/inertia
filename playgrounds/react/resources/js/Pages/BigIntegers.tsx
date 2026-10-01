import { Head, router, useForm, usePage } from '@inertiajs/react'

const BigIntegers = ({
  safe,
  big,
  negative,
  maximum,
  boundary,
  order,
  wrapped,
}: {
  safe: number
  big: bigint
  negative: bigint
  maximum: bigint
  boundary: number
  order: { id: bigint; lines: { sku: string; reference: bigint }[] }
  wrapped: { id: bigint }
}) => {
  const { flash } = usePage()

  const submit = () => {
    router.post('/big-integers/echo', { id: big })
  }

  const safeValue = 900719925474099988n
  const hugeValue = 99999999999999999999999n

  const validationForm = useForm({
    account_id: safeValue,
    reference: 'ABC-123',
  }).withPrecognition('post', '/big-integers/validate')

  const uploadForm = useForm<{ account_id: bigint; avatar: File | null }>({
    account_id: safeValue,
    avatar: null,
  })

  const rows: [string, string, number | bigint][] = [
    ['safe', 'safe', safe],
    ['boundary', 'boundary', boundary],
    ['big', 'big', big],
    ['negative', 'negative', negative],
    ['maximum', 'maximum', maximum],
    ['order.id', 'nested', order.id],
    ['order.lines[0].reference', 'deep', order.lines[0].reference],
    ['wrapped.id', 'wrapped', wrapped.id],
  ]

  return (
    <>
      <Head title="Big Integers" />
      <h1 className="text-3xl">Big Integers</h1>

      <p className="mt-2 max-w-2xl text-gray-600">
        Integers outside JavaScript's safe range arrive as native BigInt values instead of being rounded while the page
        is parsed.
      </p>

      <div className="mt-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Props</h2>
          <table className="mt-2 text-sm">
            <thead className="text-left text-gray-500">
              <tr>
                <th className="pr-8">Prop</th>
                <th className="pr-8">Value</th>
                <th>typeof</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {rows.map(([label, id, value]) => (
                <tr key={id}>
                  <td className="pr-8">{label}</td>
                  <td className="pr-8" id={id}>
                    {String(value)}
                  </td>
                  <td>{typeof value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Precision Loss Without BigInt</h2>
          <pre className="mt-2 rounded-sm bg-gray-100 p-3 text-sm">
            {`big              ${big}\nNumber(big)      ${Number(big)}\nbig + 1n         ${big + 1n}`}
          </pre>
          <p className="mt-2 text-sm text-gray-600">
            Casting to a number is what happens without this feature enabled. Arithmetic stays exact while both operands
            are BigInt values.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Submitting</h2>
          <button onClick={submit} className="mt-2 rounded-sm bg-slate-800 px-4 py-2 text-white">
            Post big to the server
          </button>
          <pre className="mt-2 rounded-sm bg-gray-100 p-3 text-sm" id="echo">
            {Object.keys(flash ?? {}).length ? JSON.stringify(flash, null, 2) : 'Nothing submitted yet'}
          </pre>
          <p className="mt-2 text-sm text-gray-600">
            The value is sent as its digits, the same way form data and query strings send it, so the controller
            receives a numeric string.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Validation</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            The rule is <code>integer</code>. It passes because the digits arrive as a numeric string. Beyond
            PHP_INT_MAX the digits cannot become a native integer, so the same rule fails.
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              validationForm.post('/big-integers/validate')
            }}
            className="mt-2 max-w-md space-y-2 font-mono text-sm"
          >
            <p>
              account_id: <span id="validation-account-id">{String(validationForm.data.account_id)}</span>
            </p>

            <label className="block">
              reference
              <input
                id="validation-reference"
                value={validationForm.data.reference}
                onChange={(event) => validationForm.setData('reference', event.target.value)}
                onBlur={() => validationForm.validate('reference')}
                className="mt-1 w-full rounded-sm border border-gray-300 px-2 py-1"
              />
            </label>

            <div className="space-x-2">
              <button
                type="button"
                onClick={() => validationForm.setData('account_id', safeValue)}
                className="rounded-sm bg-gray-200 px-3 py-1"
              >
                Use safe value
              </button>
              <button
                type="button"
                onClick={() => validationForm.setData('account_id', hugeValue)}
                className="rounded-sm bg-gray-200 px-3 py-1"
              >
                Use value beyond PHP_INT_MAX
              </button>
              <button type="submit" className="rounded-sm bg-slate-800 px-4 py-1 text-white">
                Submit
              </button>
            </div>
          </form>

          <p className="mt-2 text-sm">
            validating:{' '}
            <span id="validation-validating" className="font-mono">
              {String(validationForm.validating)}
            </span>
          </p>
          <pre className="mt-2 rounded-sm bg-gray-100 p-3 text-sm" id="validation-errors">
            {Object.keys(validationForm.errors).length ? JSON.stringify(validationForm.errors, null, 2) : 'No errors'}
          </pre>
        </div>

        <div>
          <h2 className="text-lg font-semibold">File Upload</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            Attaching a file switches the request to multipart. The value arrives as its digits, just like a JSON
            submission.
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              uploadForm.post('/big-integers/upload')
            }}
            className="mt-2 max-w-md space-y-2"
          >
            <input
              id="upload-avatar"
              type="file"
              onChange={(event) => uploadForm.setData('avatar', event.target.files?.[0] ?? null)}
              className="block text-sm"
            />
            <button type="submit" className="rounded-sm bg-slate-800 px-4 py-1 text-sm text-white">
              Upload with account_id
            </button>
          </form>

          <pre className="mt-2 rounded-sm bg-gray-100 p-3 text-sm" id="upload-errors">
            {Object.keys(uploadForm.errors).length ? JSON.stringify(uploadForm.errors, null, 2) : 'No errors'}
          </pre>
        </div>
      </div>
    </>
  )
}

export default BigIntegers
