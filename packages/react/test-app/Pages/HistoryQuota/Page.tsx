import { Link } from '@inertiajs/react'

export default ({ pageNumber, largeData }: { pageNumber: number; largeData: string }) => {
  return (
    <div>
      <h1>History Quota Test - Page {pageNumber}</h1>
      <p>Data size: {largeData?.length?.toLocaleString()} bytes</p>

      <div style={{ marginTop: 20 }}>
        {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
          <Link key={n} href={`/history-quota/${n}`} style={{ marginRight: 10 }}>
            Page {n}
          </Link>
        ))}
      </div>

      <div style={{ height: 5000 }}></div>
    </div>
  )
}
