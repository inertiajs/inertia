import { Link, router } from '@inertiajs/react'

export default ({ foo, bar }: { foo?: string; bar: string }) => {
  return (
    <>
      <p id="foo">Foo: {foo ?? 'not loaded'}</p>
      <p id="bar">Bar: {bar}</p>
      <Link href="/once-props/optional/b">Go to Optional Page B</Link>
      <button onClick={() => router.reload({ only: ['foo'] })}>Load foo</button>
    </>
  )
}
