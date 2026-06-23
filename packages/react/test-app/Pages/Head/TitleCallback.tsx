import { Head, Link, router } from '@inertiajs/react'

export default ({ titleSuffix }: { titleSuffix?: string }) => {
  return (
    <>
      <Head title="Callback Page" />

      <h1>Title Callback Page</h1>

      <Link href="/head/reactive">Go to reactive</Link>

      <button onClick={() => router.replaceProp('titleSuffix', 'replaced')}>Replace prop</button>

      <p>Current suffix: {titleSuffix ?? 'none'}</p>
    </>
  )
}
