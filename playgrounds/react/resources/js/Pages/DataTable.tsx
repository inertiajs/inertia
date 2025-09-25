import { Head, InfiniteScroll } from '@inertiajs/react'
import Layout from '../Components/Layout'
import Spinner from '../Components/Spinner'

const DataTable = ({
  users = { data: [] },
}: {
  users?: {
    data: {
      id: number
      name: string
    }[]
  }
}) => {
  return (
    <>
      <Head title="Data Table" />

      <InfiniteScroll data="users" className="mx-auto max-w-7xl px-8" buffer={3000} slotElement="tbody">
        {({ loadingPrevious, loadingNext }) => (
          <div className="overflow-hidden rounded-2xl shadow ring-1 ring-gray-200">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {users.data.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">{user.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{user.name}</td>
                  </tr>
                ))}
                {(loadingPrevious || loadingNext) && (
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-center">
                      <Spinner className="size-6 text-gray-400" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </InfiniteScroll>
    </>
  )
}

DataTable.layout = (page: React.ReactElement) => <Layout>{page}</Layout>

export default DataTable
