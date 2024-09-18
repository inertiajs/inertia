import { Head } from '@inertiajs/react'
import Layout from '../Components/Layout'

const User = ({ user }) => {
  return (
    <>
      <Head title="User" />
      <h1 className="text-3xl">User</h1>
      <p className="mt-6">You successfully created a new user! Well not really, there is no persistence in this app.</p>
      <ul className="mt-6 space-y-2">
        <li>
          <strong>Name:</strong> {user.name}
        </li>
        <li>
          <strong>Company:</strong> {user.company}
        </li>
        <li>
          <strong>Role:</strong> {user.role}
        </li>
      </ul>
    </>
  )
}

User.layout = (page) => <Layout children={page} />

export default User
