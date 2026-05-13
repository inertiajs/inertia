import { router, usePoll } from '@inertiajs/react'

export default ({ counter, last_received }: { counter: number; last_received: number | null }) => {
  usePoll(300, () => ({
    data: { counter_seen: counter },
    only: ['last_received'],
  }))

  return (
    <>
      <div id="counter">counter: {counter}</div>
      <div id="last_received">received: {last_received ?? 'null'}</div>
      <button onClick={() => router.reload({ only: ['counter'], data: { bump: counter + 1 } })}>Increment</button>
    </>
  )
}
