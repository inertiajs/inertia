import { Link, useDeferred } from '@inertiajs/react'
import { Suspense } from 'react'

const Baz = () => {
  const { baz } = useDeferred('baz')

  return baz
}

const Qux = () => {
  const { qux } = useDeferred('qux')

  return qux
}

const Both = () => {
  const { baz, qux } = useDeferred(['baz', 'qux'])

  return `both ${baz} and ${qux}`
}
export default () => {
  return (
    <>
      <Suspense fallback={<div>Loading baz...</div>}>
        <Baz />
      </Suspense>

      <Suspense fallback={<div>Loading qux...</div>}>
        <Qux />
      </Suspense>

      <Suspense fallback={<div>Loading baz and qux...</div>}>
        <Both />
      </Suspense>

      <Link href="/deferred-props/page-2">Page 2</Link>
    </>
  )
}
