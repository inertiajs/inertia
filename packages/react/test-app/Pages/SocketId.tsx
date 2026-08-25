import { router, socketId } from '@inertiajs/react'
import { useEffect, useState } from 'react'

export default ({ socketIdHeader }: { socketIdHeader: string | null }) => {
  const [resolved, setResolved] = useState<string | null>(null)

  useEffect(() => {
    return () => socketId.resolveUsing(null)
  }, [])

  const registerResolver = () => {
    socketId.resolveUsing(() => 'socket-abc-123')
    setResolved(socketId.resolve())
  }

  const registerEmptyResolver = () => {
    socketId.resolveUsing(() => null)
    setResolved(socketId.resolve())
  }

  const clearResolver = () => {
    socketId.resolveUsing(null)
    setResolved(socketId.resolve())
  }

  const reload = () => {
    router.reload({ only: ['socketIdHeader'] })
  }

  const visitDump = () => {
    router.get('/dump/get')
  }

  const visitDumpWithOwnSocketId = () => {
    router.get('/dump/get', {}, { headers: { 'X-Socket-ID': 'socket-set-by-app' } })
  }

  return (
    <div>
      <h1>Socket Id</h1>

      <p>
        Resolved socket id: <span id="resolved">{resolved ?? 'none'}</span>
      </p>
      <p>
        Header received by the server: <span id="header">{socketIdHeader ?? 'none'}</span>
      </p>

      <button onClick={registerResolver}>Register Resolver</button>
      <button onClick={registerEmptyResolver}>Register Empty Resolver</button>
      <button onClick={clearResolver}>Clear Resolver</button>
      <button onClick={reload}>Reload</button>
      <button onClick={visitDump}>Visit Dump Page</button>
      <button onClick={visitDumpWithOwnSocketId}>Send Own Socket Id</button>
    </div>
  )
}
