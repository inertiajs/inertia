import { Deferred, Link, usePage } from '@inertiajs/react'

const Foo = () => {
  const { foo } = usePage<{ foo?: { text: string } }>().props

  return foo?.text
}

const Bar = () => {
  const { bar } = usePage<{ bar?: { text: string } }>().props

  return bar?.text
}

export default () => {
  return (
    <>
      <Deferred data="foo">{({ loading }) => (loading ? <div>Loading foo (callback)...</div> : <Foo />)}</Deferred>

      <Deferred data="bar">{({ loading }) => (loading ? <div>Loading bar (callback)...</div> : <Bar />)}</Deferred>

      <Link href="/deferred-props/page-1">Page 1</Link>
      <Link href="/deferred-props/page-2">Page 2</Link>
    </>
  )
}
