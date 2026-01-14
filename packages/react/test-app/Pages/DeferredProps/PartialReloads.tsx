import { Deferred, router, usePage } from '@inertiajs/react'

const FooTimestamp = () => {
  const { foo } = usePage<{ foo?: { timestamp: string } }>().props

  return <div id="foo-timestamp">{foo?.timestamp}</div>
}

const BarTimestamp = () => {
  const { bar } = usePage<{ bar?: { timestamp: string } }>().props

  return <div id="bar-timestamp">{bar?.timestamp}</div>
}

const PartialReloads = () => {
  const reloadOnlyFoo = () => {
    router.reload({
      only: ['foo'],
    })
  }

  const reloadOnlyBar = () => {
    router.reload({
      only: ['bar'],
    })
  }

  const reloadBoth = () => {
    router.reload({
      only: ['foo', 'bar'],
    })
  }

  return (
    <>
      <Deferred data="foo" fallback={<div>Loading foo...</div>}>
        <FooTimestamp />
      </Deferred>

      <Deferred data="bar" fallback={<div>Loading bar...</div>}>
        <BarTimestamp />
      </Deferred>

      <button onClick={reloadOnlyFoo}>Reload foo only</button>
      <button onClick={reloadOnlyBar}>Reload bar only</button>
      <button onClick={reloadBoth}>Reload both</button>
    </>
  )
}

export default PartialReloads
