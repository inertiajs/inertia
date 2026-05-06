import { Deferred, Head, router } from '@inertiajs/react'
import DeferredUsers from '../Components/DeferredUsers'

const Defer = ({
  stats,
}: {
  users?: {
    id: number
    name: string
    email: string
  }[]
  organizations?: {
    id: number
    name: string
    url: string
  }[]
  foods?: {
    id: number
    name: string
  }[]
  stats?: {
    visitors: number
    revenue: number
  } | null
}) => {
  const retryStats = () => {
    router.reload({
      only: ['stats'],
      headers: { 'X-Rescue-Prop-Success': 'true' },
    })
  }

  return (
    <>
      <Head title="Form" />
      <h1 className="text-3xl">Defer</h1>
      <div className="mt-6 rounded-sm border border-yellow-500 bg-yellow-200 p-4">
        <p>Page is loaded!</p>
      </div>

      <div className="mt-6 flex space-x-6">
        <div className="w-1/2 rounded-sm border border-gray-200 p-4">
          <Deferred data="users" fallback={<p>Loading Users...</p>}>
            <DeferredUsers />
          </Deferred>
        </div>

        <div className="w-1/2 rounded-sm border border-gray-200 p-4">
          {/* <Suspense fallback={<p>Loading Food...</p>}>
            <DeferredFood />
          </Suspense> */}
        </div>

        <div className="w-1/2 rounded-sm border border-gray-200 p-4">
          {/* <Suspense fallback={<p>Loading Organizations...</p>}>
            <DeferredOrganizations />
          </Suspense> */}
        </div>

        <div className="w-1/2 rounded-sm border border-gray-200 p-4">
          <Deferred
            data="stats"
            fallback={<p>Loading Stats...</p>}
            rescue={({ reloading }) => (
              <div className="rounded-md border border-red-300 bg-red-50 p-3 text-red-800">
                <p className="font-semibold">Unable to load stats.</p>
                <button
                  type="button"
                  onClick={retryStats}
                  disabled={reloading}
                  className="mt-2 rounded bg-red-600 px-3 py-1 text-sm text-white disabled:opacity-50"
                >
                  {reloading ? 'Retrying...' : 'Retry'}
                </button>
              </div>
            )}
          >
            {stats && (
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Visitors</dt>
                  <dd className="text-2xl font-semibold">{stats.visitors}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Revenue</dt>
                  <dd className="text-2xl font-semibold">${stats.revenue}</dd>
                </div>
              </dl>
            )}
          </Deferred>
        </div>
      </div>
    </>
  )
}

export default Defer
