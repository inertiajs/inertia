import { Head, router, usePage } from '@inertiajs/react'

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
            The value is encoded on submit and decoded by the Inertia middleware, so the controller receives an integer.
          </p>
        </div>
      </div>
    </>
  )
}

export default BigIntegers
