import { Deferred, Link, usePage } from '@inertiajs/react'

const Baz = () => {
  const { baz } = usePage<{ baz?: string }>().props

  return baz
}

const Qux = () => {
  const { qux } = usePage<{ qux?: string }>().props

  return qux
}

const Both = () => {
  const { baz, qux } = usePage<{ baz?: string; qux?: string }>().props

  return `both ${baz} and ${qux}`
}
export default () => {
  return (
    <>
      <Deferred data="baz" fallback={<div>Loading baz...</div>}>
        <Baz />
      </Deferred>

      <Deferred data="qux" fallback={<div>Loading qux...</div>}>
        <Qux />
      </Deferred>

      <Deferred data={['baz', 'qux']} fallback={<div>Loading baz and qux...</div>}>
        <Both />
      </Deferred>

      <Link href="/deferred-props/page-2">Page 2</Link>
    </>
  )
}
