import { Deferred, Head } from '@inertiajs/react'
import DeferredUsers from '../Components/DeferredUsers'
import Layout from '../Components/Layout'

const Defer = ({
  users,
  foods,
  organizations,
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
}) => {
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
      </div>
    </>
  )
}

Defer.layout = Layout

export default Defer
