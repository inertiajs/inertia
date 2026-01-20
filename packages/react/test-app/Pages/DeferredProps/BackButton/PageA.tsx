import { Deferred, Link, usePage } from '@inertiajs/react'

const FastProp = () => {
  const { fastProp } = usePage<{ fastProp?: string }>().props

  return fastProp
}

const SlowProp = () => {
  const { slowProp } = usePage<{ slowProp?: string }>().props

  return slowProp
}

export default () => {
  return (
    <>
      <Deferred data="fastProp" fallback={<div>Loading fast prop...</div>}>
        <FastProp />
      </Deferred>

      <Deferred data="slowProp" fallback={<div>Loading slow prop...</div>}>
        <SlowProp />
      </Deferred>

      <Link href="/deferred-props/back-button/b">Go to Page B</Link>
    </>
  )
}
