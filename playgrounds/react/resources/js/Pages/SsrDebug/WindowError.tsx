import { Head, Link } from '@inertiajs/react'

// This will cause an SSR error because window doesn't exist in Node.js
const viewportWidth = window.innerWidth

const WindowError = () => {
  return (
    <>
      <Head title="Window Error - SSR Debug" />
      <h1 className="text-3xl">Window Error Demo</h1>

      <p className="mt-6">
        If you're seeing this page, it means SSR failed and Laravel fell back to client-side rendering. Check your Vite
        console for the error message!
      </p>

      <p className="mt-4">
        Viewport width: <strong>{viewportWidth}px</strong>
      </p>

      <p className="mt-6">
        <Link href="/ssr-debug" className="text-blue-700 underline">
          Back to SSR Debug
        </Link>
      </p>
    </>
  )
}

export default WindowError
