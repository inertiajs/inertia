import { Head, Link } from '@inertiajs/react'

export default () => {
  return (
    <>
      <Head title="Multiple Elements Test">
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Testing multiple head elements" />
        <meta name="keywords" content="test, vue, inertia" />
        <meta property="og:title" content="Open Graph Title" />
        <meta property="og:description" content="Open Graph Description" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="/custom.css" />
        <link rel="canonical" href="https://example.com/page" />
      </Head>

      <div>
        <h1>Multiple Head Elements</h1>
        <p>Check the document head for multiple elements</p>
        <Link id="navigate-away" href="/">
          Go Home
        </Link>
        <Link id="navigate-back" href="/head/mixed">
          Back to Mixed
        </Link>
      </div>
    </>
  )
}
