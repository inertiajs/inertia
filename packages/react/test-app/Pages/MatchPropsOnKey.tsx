import { router } from '@inertiajs/react'
import { useState } from 'react'

interface FooItem {
  name: string;
}

interface FooProps {
  page: number;
  data: FooItem[];
  companies: FooItem[];
  teams: FooItem[];
  per_page: number;
  meta: {
    label: string;
  };
}

export default ({ bar, foo, baz }: { bar: number[]; foo: FooProps; baz: number[] }) => {
  const [page, setPage] = useState(foo.page)

  const reloadIt = () => {
    router.reload({
      data: {
        page,
      },
      only: ['foo', 'baz'],
      onSuccess(visit) {
        // TODO: Refactor 'any' to a more specific type
        setPage((visit.props as any).foo.page)
      },
    })
  }

  const getFresh = () => {
    setPage(0)
    router.reload({
      reset: ['foo', 'baz'],
    })
  }

  return (
    <>
      <div>bar count is {bar.length}</div>
      <div>baz count is {baz.length}</div>
      <div>foo.data count is {foo.data.length}</div>
      <div>first foo.data name is {foo.data[0].name}</div>
      <div>last foo.data name is {foo.data[foo.data.length - 1].name}</div>
      <div>foo.companies count is {foo.companies.length}</div>
      <div>first foo.companies name is {foo.companies[0].name}</div>
      <div>last foo.companies name is {foo.companies[foo.companies.length - 1].name}</div>
      <div>foo.teams count is {foo.teams.length}</div>
      <div>first foo.teams name is {foo.teams[0].name}</div>
      <div>last foo.teams name is {foo.teams[foo.teams.length - 1].name}</div>
      <div>foo.page is {foo.page}</div>
      <div>foo.per_page is {foo.per_page}</div>
      <div>foo.meta.label is {foo.meta.label}</div>
      <button onClick={reloadIt}>Reload</button>
      <button onClick={getFresh}>Get Fresh</button>
    </>
  )
}
