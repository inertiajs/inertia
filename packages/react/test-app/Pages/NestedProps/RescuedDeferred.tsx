import { Deferred, router, usePage } from '@inertiajs/react'

const Notifications = () => {
  const { auth } = usePage<{ auth: { notifications?: string[] } }>().props

  return <p id="notifications">Notifications: {auth.notifications?.join(', ')}</p>
}

export default () => {
  const { auth } = usePage<{ auth: { user?: string; notifications?: string[] } }>().props

  return (
    <>
      <p id="user">User: {auth.user}</p>

      <Deferred
        data="auth.notifications"
        fallback={<div id="loading">Loading notifications...</div>}
        rescue={
          <button id="retry" onClick={() => router.reload({ only: ['auth'], headers: { 'X-Test-Retry': 'true' } })}>
            Retry auth
          </button>
        }
      >
        <Notifications />
      </Deferred>
    </>
  )
}
