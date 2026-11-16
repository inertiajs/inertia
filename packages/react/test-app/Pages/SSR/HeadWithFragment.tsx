import { Head } from '@inertiajs/react'

export default () => {
  return (
    <>
      <Head title="Head with fragment">
        <meta name="before-fragment" content="before" />
        <>
          <meta name="in-fragment-a" content="a" />
          <meta name="in-fragment-b" content="b" />
        </>
        <meta name="after-fragment" content="after" />
      </Head>
      <div>
        <p>Head fragment test</p>
      </div>
    </>
  )
}
