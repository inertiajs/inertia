import { Link, router } from '@inertiajs/react'

export default ({ foo, bar }: { foo: string; bar: string }) => {
  return (
    <>
      <p id="foo">Foo: {foo}</p>
      <p id="bar">Bar: {bar}</p>
      <Link href="/once-props/page-a">Go to Page A</Link>
      <button onClick={() => router.reload({ only: ['foo'] })}>Reload (only foo)</button>
    </>
  )
}
