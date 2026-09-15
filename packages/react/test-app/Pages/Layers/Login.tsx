import { router } from '@inertiajs/react'

export default () => {
  const signIn = () => {
    router.post('/layers/login')
  }

  return (
    <>
      <div id="login-page">Sign in to continue</div>

      <button onClick={signIn}>Sign in</button>
    </>
  )
}
