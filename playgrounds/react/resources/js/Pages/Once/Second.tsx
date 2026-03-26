import { Head } from '@inertiajs/react'
import Layout from './Layout'

export default function Second({ foo, bar, baz2, qux }: { foo: string; bar: string; baz2: string; qux?: string }) {
  return (
    <>
      <Head title="Once Props: Second Page" />
      <h1 className="text-3xl">Once Props: Second Page</h1>
      <p>Foo: {foo}</p>
      <p>Bar: {bar}</p>
      <p>Baz: {baz2}</p>
      <p>Qux: {qux ?? 'Loading...'}</p>
    </>
  )
}

Second.layout = Layout
