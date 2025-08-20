import { Head } from '@inertiajs/react'

export default () => {
  return (
    <>
      <Head title="Test Head Component">
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content='This is an "escape" example' />
        {/* @ts-expect-error - The content attribute must be a string, we support passing other types for backwards compatibility */}
        <meta name="number" content={0} />
        {/* @ts-expect-error */}
        <meta name="boolean" content={true} />
        {/* @ts-expect-error */}
        <meta name="false" content={false} />
        {/* @ts-expect-error */}
        <meta name="null" content={null} />
        <meta name="undefined" content={undefined} />
        {/* @ts-expect-error */}
        <meta name="float" content={3.14} />
      </Head>

      <h1 style={{ fontSize: '40px' }}>Head Component</h1>
    </>
  )
}
