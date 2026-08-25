import { Head, router, usePage, useProp } from '@inertiajs/react'
import { useEffect, useRef, useState } from 'react'

export default ({
  order,
  stats,
  activity,
  renderedAt,
  triggeredAt,
  socketIdHeader,
}: {
  order: { id: number; reference: string; status: string; total: number; updated_at: string }
  stats: { orders: number; revenue: number }
  activity: { at: string; message: string }[]
  renderedAt: string
  triggeredAt: string
  socketIdHeader: string | null
}) => {
  const page = usePage()

  const orderProp = useProp('order')
  const activityProp = useProp('activity')

  const [reloads, setReloads] = useState(0)
  const [events, setEvents] = useState(0)
  const [lastRequest, setLastRequest] = useState('none')
  const [log, setLog] = useState<{ id: number; line: string }[]>([])
  const [paused, setPaused] = useState(false)

  const logId = useRef(0)

  const stamp = () => new Date().toLocaleTimeString('en-GB', { hour12: false })

  const note = (message: string) =>
    setLog((entries) => [{ id: ++logId.current, line: `${stamp()} ${message}` }, ...entries].slice(0, 12))

  // The trigger buttons ask for a prop no broadcast feeds, so anything that
  // changes in the live sections below came from Reverb and nothing else
  const trigger = (url: string) => router.post(url, {}, { only: ['triggeredAt'], preserveScroll: true })

  const togglePause = () => {
    setPaused((value) => {
      const next = !value

      next ? router.live.pause() : router.live.resume()
      note(next ? 'Paused live updates' : 'Resumed live updates')

      return next
    })
  }

  // The listeners are registered once, so the manifest is read through a ref
  const manifest = useRef(page.liveProps)
  manifest.current = page.liveProps

  useEffect(() => {
    const stopListeners = [
      router.on('live', (event) => {
        setEvents((count) => count + 1)
        note(`event ${event.detail.event.split('\\').pop()} to [${event.detail.props.join(', ')}]`)
      }),
      router.on('start', (event) => {
        const { only, reset, prefetch } = event.detail.visit
        const requested = [...only, ...reset]

        // A full page load asks for nothing in particular, and a prefetch is
        // aimed at another page, so neither is a live reload
        if (prefetch || requested.length === 0) {
          return
        }

        // The trigger buttons issue their own partial request for `triggeredAt`.
        // Counting it here is what made the demo look like it reloaded twice, so
        // only a request asking purely for live props counts as a live reload
        const isLiveReload = requested.every((prop) => prop in (manifest.current ?? {}))

        if (!isLiveReload) {
          note(`demo request only=[${requested.join(', ')}]`)
          return
        }

        setReloads((count) => count + 1)
        setLastRequest(`only=[${requested.join(', ')}]`)
        note(`live reload only=[${requested.join(', ')}]`)
      }),
    ]

    return () => stopListeners.forEach((stop) => stop())
  }, [])

  return (
    <>
      <Head title="Live Props" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Live props over Reverb</h1>
          <p className="mt-1 text-slate-600">
            Open this page in two windows side by side. Everything below updates without a page reload.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div
            className={`rounded-lg border-2 p-4 ${
              orderProp.loading ? 'border-amber-400 bg-amber-50' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">order</h2>
              {orderProp.loading && <span className="text-sm text-amber-700">refreshing…</span>}
            </div>
            <dl className="mt-2 space-y-1 text-sm">
              <div>
                <span className="text-slate-500">reference</span> {order.reference}
              </div>
              <div>
                <span className="text-slate-500">status</span>{' '}
                <span className="font-mono font-bold">{order.status}</span>
              </div>
              <div>
                <span className="text-slate-500">total</span> {order.total}
              </div>
              <div>
                <span className="text-slate-500">changed at</span> {order.updated_at}
              </div>
            </dl>
          </div>

          <div className="rounded-lg border-2 border-slate-200 p-4">
            <h2 className="font-semibold">stats</h2>
            <p className="mt-1 text-xs text-slate-500">
              Same channel and event as the order, so both refresh in one request.
            </p>
            <dl className="mt-2 space-y-1 text-sm">
              <div>
                <span className="text-slate-500">orders</span> {stats.orders}
              </div>
              <div>
                <span className="text-slate-500">revenue</span> {stats.revenue}
              </div>
            </dl>
          </div>

          <div
            className={`rounded-lg border-2 p-4 ${
              activityProp.loading ? 'border-amber-400 bg-amber-50' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">activity</h2>
              {activityProp.loading && <span className="text-sm text-amber-700">refreshing…</span>}
            </div>
            <p className="mt-1 text-xs text-slate-500">Throttled to 4s by the manifest.</p>
            <ul className="mt-2 space-y-1 text-sm">
              {activity.map((entry) => (
                <li key={entry.at + entry.message} className="font-mono text-xs">
                  {entry.at} {entry.message}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="rounded bg-slate-800 px-4 py-2 text-white" onClick={() => trigger('/live/order')}>
            Broadcast to everyone
          </button>
          <button
            className="rounded bg-emerald-700 px-4 py-2 text-white"
            onClick={() => trigger('/live/order-to-others')}
          >
            Broadcast toOthers()
          </button>
          <button className="rounded bg-slate-800 px-4 py-2 text-white" onClick={() => trigger('/live/activity')}>
            Broadcast activity
          </button>
          <button className="rounded bg-slate-800 px-4 py-2 text-white" onClick={() => trigger('/live/both')}>
            Broadcast both events
          </button>
          <button className="rounded bg-slate-800 px-4 py-2 text-white" onClick={() => trigger('/live/burst')}>
            Burst of 8
          </button>
          <button className="rounded border border-slate-300 px-4 py-2" onClick={togglePause}>
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button className="rounded border border-slate-300 px-4 py-2" onClick={() => router.live.refresh('order')}>
            Refresh order
          </button>
          <button className="rounded border border-slate-300 px-4 py-2" onClick={() => trigger('/live/reset')}>
            Reset
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <dl className="rounded-lg bg-slate-100 p-4 text-sm">
            <div>
              <span className="text-slate-500">page rendered at</span> <b>{renderedAt}</b> (never changes here)
            </div>
            <div>
              <span className="text-slate-500">last trigger at</span> {triggeredAt}
            </div>
            <div>
              <span className="text-slate-500">socket id the server saw</span> {socketIdHeader ?? 'none'}
            </div>
            <div>
              <span className="text-slate-500">broadcast events received</span> {events}
            </div>
            <div>
              <span className="text-slate-500">live reloads</span> {reloads}
            </div>
            <div>
              <span className="text-slate-500">last live request</span> <code>{lastRequest}</code>
            </div>
          </dl>

          <div className="rounded-lg bg-slate-900 p-4 font-mono text-xs text-slate-100">
            {log.map((entry) => (
              <div key={entry.id}>{entry.line}</div>
            ))}
            {log.length === 0 && <div>waiting for events…</div>}
          </div>
        </div>
      </div>
    </>
  )
}
