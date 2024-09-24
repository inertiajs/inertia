import { Link, useDeferred } from '@inertiajs/react'
import { Suspense } from 'react'

const Foo = () => {
  const { foo } = useDeferred('foo')

  return foo
}

const Bar = () => {
  const { bar } = useDeferred('bar')

  return bar
}

export default () => {
  return (
    <>
      <Suspense fallback={<div>Loading foo...</div>}>
        <Foo />
      </Suspense>

      <Suspense fallback={<div>Loading bar...</div>}>
        <Bar />
      </Suspense>

      <Link href="/deferred-props/page-2">Page 2</Link>
    </>
  )
}
