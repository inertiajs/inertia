import { config, Head } from '@inertiajs/react'

export default () => {
  config.set('future.useDataInertiaHeadAttribute', true)

  return (
    <>
      <Head title="Test Head Component">
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <h1 style={{ fontSize: '40px' }}>Head Component</h1>
    </>
  )
}
