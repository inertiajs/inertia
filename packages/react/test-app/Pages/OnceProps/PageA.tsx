import { Link, router } from '@inertiajs/react'

export default ({ foo, bar }: { foo: string; bar: string }) => {
  return (
    <>
      <p id="foo">Foo: {foo}</p>
      <p id="bar">Bar: {bar}</p>
      <Link href="/once-props/page-b">Go to Page B</Link>
      <Link href="/once-props/page-c">Go to Page C</Link>
      <button onClick={() => router.reload({ only: ['foo'] })}>Reload (only foo)</button>
    </>
  )
}
