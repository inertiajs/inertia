import { Link, router } from '@inertiajs/react'

export default () => (
  <>
    <div>Page: Reload Origin</div>

    <button onClick={() => router.reload({ headers: { 'X-Repro-Delay': '1' } })}>Reload</button>
    <Link href="/async-visits/page-c">Go to C</Link>
  </>
)
