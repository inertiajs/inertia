import { Deferred } from '@inertiajs/react'

export default ({ largeData }: { largeData?: string }) => {
  return (
    <div>
      <h1>History Quota Test - Deferred</h1>

      <Deferred data="largeData" fallback={<p>Loading large data...</p>}>
        <p>Data size: {largeData?.length?.toLocaleString()} bytes</p>
      </Deferred>
    </div>
  )
}
