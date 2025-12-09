import { Link, router } from '@inertiajs/react'

export default ({ foo, bar }: { foo: string; bar: string }) => {
  return (
    <>
      <p id="foo">Foo: {foo}</p>
      <p id="bar">Bar: {bar}</p>
      <Link href="/once-props/ttl/b">Go to TTL Page B</Link>
      <Link href="/once-props/ttl/c" prefetch="mount">
        Go to TTL Page C
      </Link>
      <button onClick={() => router.reload({ only: ['foo'] })}>Reload foo</button>
    </>
  )
}
