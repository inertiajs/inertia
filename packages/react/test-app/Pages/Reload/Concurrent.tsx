import { router, usePage } from '@inertiajs/react'

export default () => {
  const { foo, bar } = usePage<{ foo?: string; bar?: string }>().props

  function reloadBothProps() {
    router.reload({ only: ['foo'] })
    setTimeout(() => router.reload({ only: ['bar'] }), 50)
  }

  return (
    <div>
      <div id="foo">Foo: {foo}</div>
      <div id="bar">Bar: {bar}</div>

      <button onClick={reloadBothProps}>Reload both props</button>
    </div>
  )
}
