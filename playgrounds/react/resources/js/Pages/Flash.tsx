import { Head, Link, router, usePage } from '@inertiajs/react'
import FlashLayout from '../Components/FlashLayout'

const Flash = () => {
  const { flash } = usePage()

  const triggerFrontendFlash = () => {
    router.flash('message', 'Hello from the frontend!')
  }

  const triggerMultipleFlash = () => {
    router.flash({
      message: 'Multiple items',
      count: 42,
    })
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
              Flash with back()
            </button>
          </form>
          <div>
            <button
              onClick={() => router.post('/flash/submit')}
              className="rounded-sm bg-slate-800 px-4 py-2 text-white"
            >
              Flash with redirect
            </button>
          </div>
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

Flash.layout = (page) => <FlashLayout children={page} />

export default Flash
