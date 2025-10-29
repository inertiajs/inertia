import { router } from '@inertiajs/react'
import { useState } from 'react'

type PageProps = {
  bar: number[]
  foo: { page: number; data: number[]; per_page: number; meta: { label: string } }
  baz: number[]
}

export default ({ bar, foo, baz }: PageProps) => {
  const [page, setPage] = useState(foo.page)

  const reloadIt = () => {
    router.reload({
      data: {
        page,
      },
      only: ['foo', 'baz'],
      onSuccess(visit) {
        setPage((visit.props as unknown as PageProps).foo.page)
      },
    })
  }

  const getFresh = () => {
    setPage(0)
    router.visit('/deep-merge-props', {
      reset: ['foo', 'baz'],
    })
  }

  return (
    <>
      <div>bar count is {bar.length}</div>
      <div>baz count is {baz.length}</div>
      <div>foo.data count is {foo.data.length}</div>
      <div>foo.page is {foo.page}</div>
      <div>foo.per_page is {foo.per_page}</div>
      <div>foo.meta.label is {foo.meta.label}</div>
      <button onClick={reloadIt}>Reload</button>
      <button onClick={getFresh}>Get Fresh</button>
    </>
  )
}
