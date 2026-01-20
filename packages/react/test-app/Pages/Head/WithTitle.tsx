import { Head } from '@inertiajs/react'

export default () => {
  return (
    <>
      <Head>
        {/* Title as a child element instead of prop */}
        <title>Title from Children</title>
        <meta name="description" content="Title set via children, not prop" />
      </Head>

      <div>
        <h1>Title in Children</h1>
        <p>Tests title element as a child instead of using title prop</p>
      </div>
    </>
  )
}
