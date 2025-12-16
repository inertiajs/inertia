import { Deferred, router, usePage } from '@inertiajs/react'

const Results = () => {
  const { results } = usePage<{ results?: { data: string[]; page: number } }>().props

  return (
    <>
      <div id="results-data">{results?.data?.join(', ')}</div>
      <div id="results-page">Page: {results?.page}</div>
    </>
  )
}

export default () => {
  const handleReload = () => {
    router.reload({
      data: { page: 2 },
    })
  }

  return (
    <>
      <Deferred data="results" fallback={<div>Loading results...</div>}>
        <Results />
      </Deferred>

      <button onClick={handleReload}>Reload with page 2</button>
    </>
  )
}
