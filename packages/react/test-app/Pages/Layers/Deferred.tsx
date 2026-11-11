import { Deferred } from '@inertiajs/react'

export default ({ name, stats }: { name: string; stats?: number[] }) => (
  <>
    <div>Deferred layer: {name}</div>

    <Deferred data="stats" fallback={<div data-testid="deferred-fallback">Loading stats...</div>}>
      <div data-testid="deferred-stats">{stats?.join(',')}</div>
    </Deferred>
  </>
)
