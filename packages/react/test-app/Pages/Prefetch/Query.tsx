import { Link } from '@inertiajs/react'

export default ({ term }: { term: string | null }) => {
  return (
    <div>
      <p id="results">Results for: {term ?? 'nothing'}</p>

      <Link method="query" href="/prefetch/query" data={{ term: 'apple' }} prefetch>
        Search Apple
      </Link>
      <Link method="query" href="/prefetch/query" data={{ term: 'banana' }} prefetch>
        Search Banana
      </Link>
    </div>
  )
}
