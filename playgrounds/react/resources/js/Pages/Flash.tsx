import { Head, Link, router, usePage } from '@inertiajs/react'
import { useEffect, useState } from 'react'

const Flash = () => {
  const { flash } = usePage()
  const [flashLog, setFlashLog] = useState<Record<string, unknown>[]>([])

  useEffect(() => {
    return router.on('flash', ({ detail: { flash } }) => {
      setFlashLog((prev) => [...prev, flash])
    })
  }, [])

  const triggerFrontendFlash = () => {
    router.flash('message', 'Hello from the frontend!')
  }

  const triggerMultipleFlash = () => {
    router.flash({
      message: 'Multiple items',
      count: 42,
    })
  }

  const clearLog = () => {
    setFlashLog([])
  }

  return (
    <>
      <Head title="Flash" />
      <h1 className="text-3xl">Flash</h1>

      <div className="mt-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Current page.flash</h2>
          <pre className="mt-2 rounded-sm bg-gray-100 p-3 text-sm">{JSON.stringify(flash ?? 'null', null, 2)}</pre>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Flash Event Log</h2>
          <pre className="mt-2 rounded-sm bg-gray-100 p-3 text-sm">
            {JSON.stringify(flashLog.length ? flashLog : 'No flash events yet', null, 2)}
          </pre>
          {flashLog.length > 0 && (
            <button onClick={clearLog} className="mt-2 text-sm text-gray-500 underline">
              Clear log
            </button>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Server-side Flash</h2>
          <div>
            <Link href="/flash/direct" className="rounded-sm bg-slate-800 px-4 py-2 text-white">
              Flash with render
            </Link>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              router.post('/flash/form')
            }}
          >
            <button type="submit" className="rounded-sm bg-slate-800 px-4 py-2 text-white">
              Flash with redirect
            </button>
          </form>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Frontend Flash</h2>
          <div className="flex gap-3">
            <button onClick={triggerFrontendFlash} className="rounded-sm bg-slate-800 px-4 py-2 text-white">
              router.flash(key, value)
            </button>
            <button onClick={triggerMultipleFlash} className="rounded-sm bg-slate-800 px-4 py-2 text-white">
              router.flash(object)
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Flash
