import { Link, router } from '@inertiajs/react'

export default ({ foo, bar }: { foo: string; bar: string }) => {
  return (
    <>
      <p id="foo">Foo: {foo}</p>
      <p id="bar">Bar: {bar}</p>
      <Link href="/once-props/partial-reload/b">Go to Partial Reload B</Link>
      <button onClick={() => router.reload({ only: ['foo'] })}>Reload (only foo)</button>
    </>
  )
}
