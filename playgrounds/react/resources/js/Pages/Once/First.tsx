import { Head } from '@inertiajs/react'
import Layout from './Layout'

const First = ({ foo, bar, baz1, qux }: { foo: string; bar: string; baz1: string; qux?: string }) => {
  return (
    <>
      <Head title="Once Props: First Page" />
      <h1 className="text-3xl">Once Props: First Page</h1>
      <p>Foo: {foo}</p>
      <p>Bar: {bar}</p>
      <p>Baz: {baz1}</p>
      <p>Qux: {qux ?? 'Loading...'}</p>
    </>
  )
}

First.layout = Layout

export default First
