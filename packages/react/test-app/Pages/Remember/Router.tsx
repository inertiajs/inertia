import { router } from '@inertiajs/react'
import { useState } from 'react'

export default () => {
  const [foo, setFoo] = useState('-')
  const [bar, setBar] = useState(0)

  function remember() {
    router.remember('foo')
    router.remember(42, 'bar')
  }

  function restore() {
    setFoo(router.restore() ?? '-')
    setBar(router.restore('bar') ?? 0)
  }

  function restoreTyped() {
    const foo = router.restore<string>()
    const bar = router.restore<number>('bar')

    foo?.startsWith('f')
    bar?.toFixed(2)

    setFoo(foo ?? '-')
    setBar(bar ?? 0)

    // @ts-expect-error - Testing type safety
    foo?.toFixed(2)
    // @ts-expect-error - Testing type safety
    bar?.startsWith('b')
  }

  return (
    <div>
      <p>Foo: {foo}</p>
      <p>Bar: {bar}</p>
      <button onClick={remember}>Remember</button>
      <button onClick={restore}>Restore</button>
      <button onClick={restoreTyped}>Restore Typed</button>
    </div>
  )
}
