import { router, usePage } from '@inertiajs/react'

export default () => {
  const { foo, bar, timeframe } = usePage<{ foo?: string; bar?: string; timeframe?: string }>().props

  function reloadBothPropsWithData() {
    router.reload({ only: ['foo'], data: { timeframe: 'week' } })
    setTimeout(() => router.reload({ only: ['bar'], data: { timeframe: 'week' } }), 50)
  }

  return (
    <div>
      <div id="foo">Foo: {foo}</div>
      <div id="bar">Bar: {bar}</div>
      <div id="timeframe">Timeframe: {timeframe}</div>

      <button onClick={reloadBothPropsWithData}>Reload both props with data</button>
    </div>
  )
}
