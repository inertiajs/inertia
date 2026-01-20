import { Deferred, Link, usePage } from '@inertiajs/react'

const Foo = () => {
  const { foo } = usePage<{ foo?: { text: string } }>().props

  return <>{foo?.text}</>
}

export default ({ bar }: { bar: string }) => {
  return (
    <>
      <Deferred data="foo" fallback={<div>Loading foo...</div>}>
        <p id="foo">
          Foo: <Foo />
        </p>
      </Deferred>

      <p id="bar">Bar: {bar}</p>

      <Link href="/once-props/deferred/b">Go to Deferred Page B</Link>
      <Link href="/once-props/deferred/c" prefetch="mount">
        Go to Deferred Page C
      </Link>
    </>
  )
}
