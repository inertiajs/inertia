import { Link, router } from '@inertiajs/react'
import MainLayout from '../../Components/Layout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <MainLayout>
      {children}
      <Link href="/once/1" className="text-blue-500 underline">
        Go to First Page
      </Link>
      <Link href="/once/2" className="ml-4 text-blue-500 underline">
        Go to Second Page
      </Link>
      <Link href="/once/3" className="ml-4 text-blue-500 underline">
        Go to Third Page
      </Link>
      <Link href="/once/4" className="ml-4 text-blue-500 underline" prefetch="mount">
        Go to Fourth Page
      </Link>
      <button onClick={() => router.reload({ only: ['foo'] })} className="ml-4 text-blue-500 underline">
        Reload Foo
      </button>
      <button onClick={() => router.reload({ only: ['bar'] })} className="ml-4 text-blue-500 underline">
        Reload Bar
      </button>
      <button
        onClick={() => router.reload({ only: ['baz1', 'baz2', 'baz3', 'baz4'] })}
        className="ml-4 text-blue-500 underline"
      >
        Reload Baz
      </button>
      <button onClick={() => router.reload({ only: ['qux'] })} className="ml-4 text-blue-500 underline">
        Reload Qux
      </button>
    </MainLayout>
  )
}
