import { Deferred, Link, usePage } from '@inertiajs/react'

const Data = () => {
  const { data } = usePage<{ data?: string }>().props

  return data
}

export default () => {
  return (
    <>
      <Deferred data="data" fallback={<div>Loading data...</div>}>
        <Data />
      </Deferred>

      <Link href="/deferred-props/back-button/a">Go to Page A</Link>
    </>
  )
}
