import { Head } from '@inertiajs/react'
import Layout from '../Components/Layout'

const Users = ({ users }) => {
  return (
    <>
      <Head title="Users" />
      <h1 className="text-3xl">Users</h1>
      <div className="mt-6 w-full max-w-2xl overflow-hidden rounded-sm border border-gray-200 shadow-xs">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="px-4 py-2">Id</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-gray-200">
                <td className="px-4 py-2">{user.id}</td>
                <td className="px-4 py-2">{user.name}</td>
                <td className="px-4 py-2">{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

Users.layout = (page) => <Layout children={page} />

export default Users
