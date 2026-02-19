import { Head, Link } from '@inertiajs/react'

// This will cause an SSR error because localStorage doesn't exist in Node.js
const savedTheme = localStorage.getItem('theme')

const LocalStorageError = () => {
  return (
    <>
      <Head title="LocalStorage Error - SSR Debug" />
      <h1 className="text-3xl">LocalStorage Error Demo</h1>

      <p className="mt-6">
        If you're seeing this page, it means SSR failed and Laravel fell back to client-side rendering. Check your Vite
        console for the error message!
      </p>

      <p className="mt-4">
        Saved theme: <strong>{savedTheme || '(not set)'}</strong>
      </p>

      <p className="mt-6">
        <Link href="/ssr-debug" className="text-blue-700 underline">
          Back to SSR Debug
        </Link>
      </p>
    </>
  )
}

export default LocalStorageError
