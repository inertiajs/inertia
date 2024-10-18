import { Deferred, Link, usePage } from '@inertiajs/react'

const Foo = () => {
  const { foo } = usePage().props

  return foo.text
}

const Bar = () => {
  const { bar } = usePage().props

  return bar.text
}

export default () => {
  return (
    <>
      <Deferred data="foo" fallback={<div>Loading foo...</div>}>
        <Foo />
      </Deferred>

      <Deferred data="bar" fallback={<div>Loading bar...</div>}>
        <Bar />
      </Deferred>

      <Link href="/deferred-props/page-1">Page 1</Link>
      <Link href="/deferred-props/page-2">Page 2</Link>
    </>
  )
}
