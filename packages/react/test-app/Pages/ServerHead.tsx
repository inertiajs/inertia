import { Head, Link, router } from '@inertiajs/react'

export default ({ foo, next }: { foo: string; next: string }) => {
  const override = new URLSearchParams(window.location.search).has('override')

  const replaceHead = () => {
    router.replaceProp('head', [
      '<title data-inertia="title">Replaced Head</title>',
      '<meta data-inertia="description" name="description" content="Replaced description">',
    ])
  }

  return (
    <div>
      {override && (
        <Head>
          <meta head-key="description" name="description" content="Page override" />
        </Head>
      )}
      <h1>Server Head</h1>
      <p id="foo">{foo}</p>
      <button onClick={() => router.reload({ only: ['foo'] })}>Reload foo</button>
      <button onClick={replaceHead}>Replace head client-side</button>
      <Link href={next}>Next server head page</Link>
    </div>
  )
}
