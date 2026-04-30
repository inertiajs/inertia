import { Deferred, router, usePage } from '@inertiajs/react'

const Foo = () => {
  const { foo } = usePage<{ foo?: { text: string } | null }>().props

  return <div id="foo">{foo?.text}</div>
}

export default () => {
  const retry = () => {
    router.reload({ only: ['foo'], headers: { 'X-Test-Retry': 'true' } })
  }

  return (
    <>
      <Deferred
        data="foo"
        fallback={<div>Loading foo...</div>}
        rescue={({ reloading }) => (
          <>
            <div id="foo-error">Unable to load foo.</div>
            <span id="reloading">{String(reloading)}</span>
          </>
        )}
      >
        <Foo />
      </Deferred>

      <button type="button" onClick={retry}>
        Retry
      </button>
    </>
  )
}
