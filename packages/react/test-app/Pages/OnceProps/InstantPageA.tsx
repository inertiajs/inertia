import { router } from '@inertiajs/react'

const prefetch = (url: string) => router.prefetch(url, { method: 'get' }, {})
const instantVisit = (url: string) => router.visit(url, { component: 'OnceProps/InstantPageB' })

export default ({ foo, bar }: { foo: string; bar: string }) => {
  return (
    <>
      <p id="foo">Foo: {foo}</p>
      <p id="bar">Bar: {bar}</p>

      <button onClick={() => prefetch('/once-props/instant/b')}>Prefetch Page B</button>
      <button onClick={() => instantVisit('/once-props/instant/b')}>Instant visit to Page B</button>

      <button onClick={() => prefetch('/once-props/instant/b?deferred=1')}>Prefetch Deferred Page B</button>
      <button onClick={() => instantVisit('/once-props/instant/b?deferred=1')}>Instant visit to Deferred Page B</button>
    </>
  )
}
