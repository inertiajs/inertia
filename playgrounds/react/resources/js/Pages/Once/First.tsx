import { Head } from '@inertiajs/react'
import Layout from './Layout'

const First = ({ foo, bar, baz1 }: { foo: string; bar: string; baz1: string }) => {
  return (
    <>
      <Head title="Once Props: First Page" />
      <h1 className="text-3xl">Once Props: First Page</h1>
      <p>Foo: {foo}</p>
      <p>Bar: {bar}</p>
      <p>Baz: {baz1}</p>
    </>
  )
}

First.layout = (page: React.ReactNode) => <Layout children={page} />

export default First
