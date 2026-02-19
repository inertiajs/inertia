import { Head } from '@inertiajs/react'

const Login = () => {
  return (
    <>
      <Head title="Login" />
      <h1 className="text-3xl">Login</h1>
      <p className="mt-6">
        You made a <code>POST</code> request to the logout endpoint and were redirected to the login page.
      </p>
    </>
  )
}

export default Login
