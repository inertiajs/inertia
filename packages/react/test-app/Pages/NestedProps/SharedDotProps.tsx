import { router } from '@inertiajs/react'

export default ({
  auth,
}: {
  auth: {
    user: {
      name: string
      email: string
      permissions?: string[]
    }
  }
}) => {
  return (
    <>
      <p id="name">Name: {auth.user.name}</p>
      <p id="email">Email: {auth.user.email}</p>
      <p id="permissions">Permissions: {auth.user.permissions?.join(', ')}</p>
      <button onClick={() => router.reload({ only: ['auth.user.permissions'] })}>Reload Permissions</button>
    </>
  )
}
