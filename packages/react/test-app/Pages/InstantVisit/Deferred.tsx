import { Deferred } from '@inertiajs/react'

export default ({ title, heavyData }: { title?: string; heavyData?: string }) => {
  return (
    <div>
      <div id="deferred">This is Deferred</div>
      <div id="title">Title: {title ?? 'none'}</div>

      <Deferred data="heavyData" fallback={<div id="heavy-loading">Loading heavy data...</div>}>
        <div id="heavy-data">Heavy: {heavyData}</div>
      </Deferred>
    </div>
  )
}
