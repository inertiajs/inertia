import { Deferred, Link, router } from '@inertiajs/react'

export default ({
  term,
  results,
  reloadedAt,
}: {
  term: string | null
  results?: string
  reloadedAt: number | null
}) => {
  return (
    <div>
      <p id="term">Term: {term ?? 'nothing'}</p>
      <p id="reloaded-at">Reloaded at: {reloadedAt ?? 'never'}</p>

      <Deferred data="results" fallback={<p>Loading results...</p>}>
        <p id="results">{results}</p>
      </Deferred>

      <Link method="query" href="/query-visits/search" data={{ term: 'apple' }}>
        Search Apple
      </Link>
      <Link method="query" href="/query-visits/search" data={{ term: 'banana' }}>
        Search Banana
      </Link>
      <button onClick={() => router.reload({ only: ['reloadedAt'] })}>Reload</button>
      <button onClick={() => router.reload({ only: ['reloadedAt'], headers: { 'X-Slow': 'true' } })}>
        Slow reload
      </button>
      <button onClick={() => router.reload({ data: { term: 'cherry' } })}>Reload with Cherry</button>
      <button onClick={() => router.push({ url: '/query-visits/search-elsewhere' })}>Push elsewhere</button>
      <Link href="/dump/get">Leave</Link>
    </div>
  )
}
