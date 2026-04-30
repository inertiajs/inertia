import { Head } from '@inertiajs/react'

export default ({ title }: { title: string }) => {
  return (
    <>
      <Head title={title} />
      <div>
        <p>Head title escaping test</p>
      </div>
    </>
  )
}
