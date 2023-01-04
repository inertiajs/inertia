import { Link } from '@inertiajs/react'

export default function Layout({ children }) {
  return (
    <>
      <nav className="space-x-6 bg-slate-800 p-6 text-white">
        <Link href="/">Home</Link>
        <Link href="/users">Users</Link>
      </nav>
      <main className="p-6">{children}</main>
    </>
  )
}
