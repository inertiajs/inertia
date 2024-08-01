import { Link, usePage } from '@inertiajs/react'

export default function Layout({ children }) {
  const { appName } = usePage<{ appName: string }>().props

  return (
    <>
      <nav className="flex items-center space-x-6 bg-slate-800 px-10 py-6 text-white">
        <div className="rounded-lg bg-slate-700 px-4 py-1">{appName}</div>
        <Link href="/" className="hover:underline" prefetch>
          Home
        </Link>
        <Link href="/users" className="hover:underline" prefetch="hover" cacheFor={6000}>
          Users
        </Link>
        <Link href="/article" className="hover:underline" prefetch="mount" stale-after="10s">
          Article
        </Link>
        <Link href="/form" className="hover:underline" prefetch={['mount', 'click']} stale-after="1m">
          Form
        </Link>
        <Link href="/async" className="hover:underline">
          Async
        </Link>
        <Link href="/defer" className="hover:underline">
          Defer
        </Link>
        <Link href="/poll" className="hover:underline">
          Poll
        </Link>
        <Link href="/logout" method="post" className="hover:underline">
          Logout
        </Link>
      </nav>
      <main className="px-10 py-8">{children}</main>
    </>
  )
}
