import { Deferred, usePage } from '@inertiajs/react'

const DeferredContent = () => {
  const { auth } = usePage<{
    auth: {
      notifications?: string[]
      roles?: string[]
    }
  }>().props

  return (
    <>
      <p id="notifications">Notifications: {auth.notifications?.join(', ')}</p>
      <p id="roles">Roles: {auth.roles?.join(', ')}</p>
    </>
  )
}

export default ({
  auth,
}: {
  auth: {
    user?: { name: string; email: string }
    token?: string
    notifications?: string[]
    roles?: string[]
  }
}) => {
  return (
    <>
      <p id="user">
        User: {auth.user?.name} ({auth.user?.email})
      </p>
      <p id="token">Token: {auth.token}</p>

      <Deferred data={['auth.notifications', 'auth.roles']} fallback={<div id="loading">Loading...</div>}>
        <DeferredContent />
      </Deferred>
    </>
  )
}
