import { Link, router } from '@inertiajs/react'
import { useEffect, useState } from 'react'

export default ({
  order,
  stats,
  room,
  secret,
  news,
  socketIdHeader,
}: {
  order: string
  stats: string
  room: string
  secret: string
  news: string
  socketIdHeader: string | null
}) => {
  const [log, setLog] = useState<string[]>([])

  const showLog = () => setLog(window.__inertiaEcho?.log() ?? [])

  useEffect(showLog, [])

  return (
    <div>
      <h1>Echo Transport</h1>

      <dl>
        <dt>order</dt>
        <dd id="order">{order}</dd>

        <dt>stats</dt>
        <dd id="stats">{stats}</dd>

        <dt>room</dt>
        <dd id="room">{room}</dd>

        <dt>secret</dt>
        <dd id="secret">{secret}</dd>

        <dt>news</dt>
        <dd id="news">{news}</dd>

        <dt>socket id header</dt>
        <dd id="socket-id-header">{socketIdHeader ?? 'none'}</dd>
      </dl>

      <pre id="log">{log.join('\n')}</pre>

      <button onClick={showLog}>Show Log</button>
      <button onClick={() => router.reload({ data: { drop: 'stats' } })}>Drop Stats</button>
      <button onClick={() => router.reload({ data: { swap: '1' } })}>Swap Events</button>

      <Link href="/socket-id">Leave</Link>
    </div>
  )
}
