import { Head } from '@inertiajs/react'

export default () => {
  return (
    <>
      <Head title="Test Head Component">
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content='This is an "escape" example' />
        <meta name="undefined" content={undefined} />
        {/* @ts-expect-error - The content attribute must be a string, we support passing other types for backwards compatibility */}
        <meta name="number" content={0} />
        {/* @ts-expect-error - same as above */}
        <meta name="boolean" content={true} />
        {/* @ts-expect-error - same as above */}
        <meta name="false" content={false} />
        {/* @ts-expect-error - same as above */}
        <meta name="null" content={null} />
        {/* @ts-expect-error - same as above */}
        <meta name="float" content={3.14} />
        <meta name="xss" content="<script>alert('xss')</script>" />
        <meta name="ampersand" content="Laravel & Inertia" />
        <meta name="unicode" content="Hélló! 🎉" />
      </Head>

      <h1 style={{ fontSize: '40px' }}>Head Component</h1>
    </>
  )
}
