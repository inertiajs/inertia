import { Deferred, usePage } from '@inertiajs/react'

const Foo = () => {
  const { foo } = usePage<{ foo?: string }>().props

  return <>{foo}</>
}

export default ({ bar }: { bar?: string }) => {
  return (
    <>
      <Deferred data="foo" fallback={<div>Loading foo...</div>}>
        <p id="foo">
          Foo: <Foo />
        </p>
      </Deferred>

      <p id="bar">Bar: {bar}</p>
    </>
  )
}
