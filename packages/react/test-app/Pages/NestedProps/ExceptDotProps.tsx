import { router } from '@inertiajs/react'

export default ({
  auth,
}: {
  auth: {
    user: string
    token?: string
    sessionId?: string
  }
}) => {
  return (
    <>
      <p id="user">User: {auth.user}</p>
      <p id="token">Token: {auth.token}</p>
      <p id="session-id">Session: {auth.sessionId}</p>
      <button onClick={() => router.reload({ except: ['auth.token'] })}>Reload Without Token</button>
      <button onClick={() => router.reload({ except: ['auth.token', 'auth.sessionId'] })}>
        Reload Without Token and Session
      </button>
    </>
  )
}
