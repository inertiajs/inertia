import { Head, Link, usePage } from '@inertiajs/react'
import FlashLayout from '../Components/FlashLayout'

const FlashTarget = () => {
  const { flash } = usePage()

  return (
    <>
      <Head title="Flash Target" />
      <h1 className="text-3xl">Flash Target</h1>

      <div className="mt-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Current page.flash</h2>
          <pre className="mt-2 rounded-sm bg-gray-100 p-3 text-sm">{JSON.stringify(flash ?? 'null', null, 2)}</pre>
        </div>

        <div>
          <Link href="/flash" className="rounded-sm bg-slate-800 px-4 py-2 text-white">
            Back to Flash
          </Link>
        </div>
      </div>
    </>
  )
}

FlashTarget.layout = (page) => <FlashLayout children={page} />

export default FlashTarget
