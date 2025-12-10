import { Head } from '@inertiajs/react'
import Layout from './Layout'

const Third = ({ foo, bar, baz3 }: { foo: string; bar: string; baz3: string }) => {
  return (
    <>
      <Head title="Once Props: Third Page" />
      <h1 className="text-3xl">Once Props: Third Page</h1>
      <p>Foo: {foo}</p>
      <p>Bar: {bar}</p>
      <p>Baz: {baz3}</p>
    </>
  )
}

Third.layout = (page: React.ReactNode) => <Layout children={page} />

export default Third
