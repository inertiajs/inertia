import { Link, usePage } from '@inertiajs/react'

export default function InfiniteScrollLayout({ children }) {
  const { appName } = usePage<{ appName: string }>().props

  return (
    <>
      <nav className="flex items-center space-x-6 bg-slate-800 px-10 py-6 text-white">
        <div className="rounded-lg bg-slate-700 px-4 py-1">{appName}</div>
        <Link href="/infinite-scroll/chat" className="hover:underline">
          Chat
        </Link>
        <Link href="/infinite-scroll/dashboard" className="hover:underline">
          Dashboard
        </Link>
        <Link href="/infinite-scroll/photos" className="hover:underline">
          Photos
        </Link>
      </nav>
      <main className="px-10 py-8">{children}</main>
    </>
  )
}
