import { Head, Link } from '@inertiajs/react'
import Layout from '../../Components/Layout'

// This will cause an SSR error because document doesn't exist in Node.js
const bodyClasses = document.body.className

const DocumentError = () => {
  return (
    <>
      <Head title="Document Error - SSR Debug" />
      <h1 className="text-3xl">Document Error Demo</h1>

      <p className="mt-6">
        If you're seeing this page, it means SSR failed and Laravel fell back to client-side rendering. Check your Vite
        console for the error message!
      </p>

      <p className="mt-4">
        Body classes: <strong>{bodyClasses || '(none)'}</strong>
      </p>

      <p className="mt-6">
        <Link href="/ssr-debug" className="text-blue-700 underline">
          Back to SSR Debug
        </Link>
      </p>
    </>
  )
}

DocumentError.layout = (page) => <Layout children={page} />

export default DocumentError
