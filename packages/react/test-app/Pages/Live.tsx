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
  const [lastEvent, setLastEvent] = useState('none')
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

      setLastEvent(
        [
          event.detail.channel.type,
          event.detail.channel.name,
          event.detail.event,
          event.detail.props.join('|'),
          JSON.stringify(event.detail.payload),
        ].join(' '),
      )

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

        <dt>last event</dt>
        <dd id="last-event">{lastEvent}</dd>

        <dt>subscriptions</dt>
        <dd id="subscriptions">{subscriptions.join(', ') || 'none'}</dd>

        <dt>subscription count</dt>
        <dd id="subscription-count">{subscriptions.length}</dd>
      </dl>

      <button onClick={showSubscriptions}>Show Subscriptions</button>
      <button onClick={() => setCancel((value) => !value)}>Toggle Cancel</button>
      <button onClick={() => router.live.refresh('order')}>Refresh Order</button>
      <button onClick={() => router.live.refresh('throttled')}>Refresh Throttled</button>
      <button onClick={() => router.reload({ only: ['plain'] })}>Reload Plain</button>

      <Link href="/socket-id">Leave</Link>
    </div>
  )
}
