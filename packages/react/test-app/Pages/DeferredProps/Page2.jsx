import { Deferred, Link, UsePage } from '@inertiajs/react'

const Baz = () => {
  const { baz } = UsePage().props

  return baz
}

const Qux = () => {
  const { qux } = UsePage().props

  return qux
}

const Both = () => {
  const { baz, qux } = UsePage().props

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
