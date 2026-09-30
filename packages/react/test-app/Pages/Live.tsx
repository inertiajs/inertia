import type { LiveEventDetails } from '@inertiajs/core'
import { Link, router } from '@inertiajs/react'
import { useEffect, useRef, useState } from 'react'

export default ({
  order,
  stats,
  feed,
  throttled,
  notes,
  multi,
  plain,
  account,
  socketIdHeader,
}: {
  order: string
  stats: string
  feed: string
  throttled: string
  notes: string
  multi: string
  plain: string
  account: { balance: string; currency: string }
  socketIdHeader: string | null
}) => {
  const [events, setEvents] = useState(0)
  const [lastEvent, setLastEvent] = useState<LiveEventDetails | null>(null)
  const [cancel, setCancel] = useState(false)
  const [subscriptions, setSubscriptions] = useState<string[]>([])

  // The listener is registered once, so it has to read the latest value
  const cancelRef = useRef(cancel)
  cancelRef.current = cancel

  const showSubscriptions = () => setSubscriptions(window.__inertiaLive.subscriptions())

  useEffect(() => {
    showSubscriptions()

    return router.on('live', (event) => {
      setEvents((count) => count + 1)

      setLastEvent(event.detail)

      if (cancelRef.current) {
        return false
      }
    })
  }, [])

  return (
    <div>
      <h1>Live Props</h1>

      <dl>
        <dt>order</dt>
        <dd id="order">{order}</dd>

        <dt>stats</dt>
        <dd id="stats">{stats}</dd>

        <dt>feed</dt>
        <dd id="feed">{feed}</dd>

        <dt>throttled</dt>
        <dd id="throttled">{throttled}</dd>

        <dt>notes</dt>
        <dd id="notes">{notes}</dd>

        <dt>multi</dt>
        <dd id="multi">{multi}</dd>

        <dt>plain</dt>
        <dd id="plain">{plain}</dd>

        <dt>account.balance</dt>
        <dd id="account-balance">{account.balance}</dd>

        <dt>account.currency</dt>
        <dd id="account-currency">{account.currency}</dd>

        <dt>socket id header</dt>
        <dd id="socket-id-header">{socketIdHeader ?? 'none'}</dd>

        <dt>events</dt>
        <dd id="events">{events}</dd>

        <dt>last channel</dt>
        <dd id="last-channel">{lastEvent ? `${lastEvent.channel.type}:${lastEvent.channel.name}` : 'none'}</dd>

        <dt>last event</dt>
        <dd id="last-event">{lastEvent?.event ?? 'none'}</dd>

        <dt>last props</dt>
        <dd id="last-props">{lastEvent?.props.join(', ') ?? 'none'}</dd>

        <dt>last payload</dt>
        <dd id="last-payload">{lastEvent ? JSON.stringify(lastEvent.payload) : 'none'}</dd>

        <dt>subscriptions</dt>
        <dd id="subscriptions">{subscriptions.join(', ') || 'none'}</dd>

        <dt>subscription count</dt>
        <dd id="subscription-count">{subscriptions.length}</dd>
      </dl>

      <button onClick={showSubscriptions}>Show Subscriptions</button>
      <button onClick={() => setCancel((value) => !value)}>Toggle Cancel: {String(cancel)}</button>
      <button onClick={() => router.reload({ only: ['plain'] })}>Reload Plain</button>

      <Link href="/socket-id">Leave</Link>
    </div>
  )
}
