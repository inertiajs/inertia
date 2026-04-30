import { Deferred, router, usePage } from '@inertiajs/react'

export default () => {
  const { auth, status } = usePage<{
    auth: { user?: string; token?: string; notifications?: string[] }
    status: string
  }>().props

  return (
    <>
      <p id="user">User: {auth.user}</p>
      <p id="token">Token: {auth.token}</p>
      <p id="status">Status: {status}</p>

      <Deferred
        data="auth.notifications"
        fallback={<div id="loading">Loading notifications...</div>}
        rescue={
          <button id="reload-except" onClick={() => router.reload({ except: ['auth.notifications'], headers: { 'X-Test-Retry': 'true' } })}>
            Reload without notifications
          </button>
        }
      >
        <p id="notifications">Notifications: {auth.notifications?.join(', ')}</p>
      </Deferred>
    </>
  )
}
