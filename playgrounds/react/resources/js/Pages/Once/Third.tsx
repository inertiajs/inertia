import { Head } from '@inertiajs/react'
import Layout from './Layout'

const Third = ({ foo, bar, baz3, qux }: { foo: string; bar: string; baz3: string; qux?: string }) => {
  return (
    <>
      <Head title="Once Props: Third Page" />
      <h1 className="text-3xl">Once Props: Third Page</h1>
      <p>Foo: {foo}</p>
      <p>Bar: {bar}</p>
      <p>Baz: {baz3}</p>
      <p>Qux: {qux ?? 'Loading...'}</p>
    </>
  )
}

Third.layout = Layout

export default Third
