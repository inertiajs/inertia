import { Link, usePage } from '@inertiajs/react'

export default function Layout({ children }) {
  const { appName } = usePage<{ appName: string }>().props

  return (
    <>
      <nav className="flex items-center space-x-6 bg-slate-800 px-10 py-6 text-white">
        <div className="rounded-lg bg-slate-700 px-4 py-1">{appName}</div>
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <Link href="/users" className="hover:underline">
          Users
        </Link>
        <Link href="/article" className="hover:underline">
          Article
        </Link>
        <Link href="/form" className="hover:underline">
          Form
        </Link>
        <Link href="/logout" method="post" as="button" type="button" className="hover:underline">
          Logout
        </Link>
      </nav>
      <main className="px-10 py-8">{children}</main>
    </>
  )
}
