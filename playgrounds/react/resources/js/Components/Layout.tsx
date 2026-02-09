import { Link, useLayoutProps, usePage } from '@inertiajs/react'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { appName } = usePage().props
  const { padding } = useLayoutProps({ padding: true })

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
          useForm
        </Link>
        <Link href="/form-component" className="hover:underline">
          {'<Form>'}
        </Link>
        <Link href="/form-component/precognition" className="hover:underline">
          Precognition
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
        <Link href="/chat" className="hover:underline">
          Chat
        </Link>
        <Link href="/photo-grid" className="hover:underline">
          Photo Grid
        </Link>
        <Link href="/photo-grid/horizontal" className="hover:underline">
          Photo Row
        </Link>
        <Link href="/data-table" className="hover:underline">
          Table
        </Link>
        <Link href="/once/1" className="hover:underline">
          Once
        </Link>
        <Link href="/flash" className="hover:underline">
          Flash
        </Link>
        <Link href="/ssr-debug" className="hover:underline">
          SSR Debug
        </Link>
        <Link href="/logout" method="post" className="hover:underline">
          Logout
        </Link>
      </nav>
      <main className={padding ? 'px-10 py-8' : ''}>{children}</main>
    </>
  )
}
