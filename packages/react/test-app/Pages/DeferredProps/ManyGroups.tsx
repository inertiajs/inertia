import { Deferred, Link, usePage } from '@inertiajs/react'

export default () => {
  const { foo, bar, baz, qux, quux } = usePage<{
    foo?: { text: string }
    bar?: { text: string }
    baz?: { text: string }
    qux?: { text: string }
    quux?: { text: string }
  }>().props

  return (
    <>
      <Deferred data="foo" fallback={<div>Loading foo...</div>}>
        {foo?.text}
      </Deferred>

      <Deferred data="bar" fallback={<div>Loading bar...</div>}>
        {bar?.text}
      </Deferred>

      <Deferred data="baz" fallback={<div>Loading baz...</div>}>
        {baz?.text}
      </Deferred>

      <Deferred data="qux" fallback={<div>Loading qux...</div>}>
        {qux?.text}
      </Deferred>

      <Deferred data="quux" fallback={<div>Loading quux...</div>}>
        {quux?.text}
      </Deferred>

      <Link href="/deferred-props/page-1">Page 1</Link>
      <Link href="/deferred-props/page-2">Page 2</Link>
      <Link href="/deferred-props/many-groups">Many groups</Link>
    </>
  )
}
