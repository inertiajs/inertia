import { Head } from '@inertiajs/react'
import Layout from './Layout'

const Fourth = ({ foo, bar, baz4, qux }: { foo: string; bar: string; baz4: string; qux?: string }) => {
  return (
    <>
      <Head title="Once Props: Fourth Page" />
      <h1 className="text-3xl">Once Props: Fourth Page</h1>
      <p>Foo: {foo}</p>
      <p>Bar: {bar}</p>
      <p>Baz: {baz4}</p>
      <p>Qux: {qux ?? 'Loading...'}</p>
    </>
  )
}

Fourth.layout = (page: React.ReactNode) => <Layout children={page} />

export default Fourth
