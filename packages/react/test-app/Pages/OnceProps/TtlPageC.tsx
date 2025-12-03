import { Link } from '@inertiajs/react'

export default ({ foo, bar }: { foo: string; bar: string }) => {
  return (
    <>
      <p id="foo">Foo: {foo}</p>
      <p id="bar">Bar: {bar}</p>
      <Link href="/once-props/ttl/a">Go to TTL Page A</Link>
    </>
  )
}
