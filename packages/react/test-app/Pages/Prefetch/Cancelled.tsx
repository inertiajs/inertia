import { router } from '@inertiajs/react'
import { useEffect, useRef, useState } from 'react'

const url = '/prefetch/swr/1'

export default () => {
  const [prefetchId, setPrefetchId] = useState('')
  const [cached, setCached] = useState(false)
  const [events, setEvents] = useState<string[]>([])

  const cancelToken = useRef<{ cancel: () => void } | null>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setPrefetchId(router.getPrefetching(url)?.params.id ?? '')
      setCached(router.getCached(url) !== null)
    }, 50)

    return () => clearInterval(timer)
  }, [])

  const prefetch = () => {
    router.prefetch(url, { onCancelToken: (token) => (cancelToken.current = token) }, { cacheTags: ['example'] })
  }

  const prefetchWithReplacement = () => {
    router.prefetch(url, {
      onCancelToken: (token) => (cancelToken.current = token),
      onCancel: () => router.prefetch(url),
    })
  }

  const prefetchAndCancel = () => {
    router.prefetch(url, { onCancelToken: (token) => token.cancel() })
  }

  const prefetchAndCancelWithReplacement = () => {
    router.prefetch(url, {
      onCancelToken: (token) => token.cancel(),
      onCancel: () => router.prefetch(url),
    })
  }

  const cancelPrefetch = () => {
    cancelToken.current?.cancel()
    cancelToken.current = null
  }

  const visit = () => {
    router.visit(url, {
      onCancel: () => setEvents((events) => [...events, 'cancel']),
      onFinish: () => setEvents((events) => [...events, 'finish']),
      onSuccess: () => setEvents((events) => [...events, 'success']),
    })
  }

  return (
    <div>
      <button onClick={prefetch}>Prefetch</button>
      <button onClick={prefetchWithReplacement}>Prefetch With Replacement</button>
      <button onClick={prefetchAndCancel}>Prefetch And Cancel</button>
      <button onClick={prefetchAndCancelWithReplacement}>Prefetch And Cancel With Replacement</button>
      <button onClick={cancelPrefetch}>Cancel Prefetch</button>

      <button onClick={() => router.flush(url)}>Flush</button>
      <button onClick={() => router.flushByCacheTags('example')}>Flush By Cache Tags</button>
      <button onClick={() => router.flushAll()}>Flush All</button>

      <button onClick={visit}>Visit</button>

      <div>
        Prefetching: <span id="prefetch-status">{prefetchId ? 'yes' : 'no'}</span>
      </div>
      <div>
        Prefetch ID: <span id="prefetch-id">{prefetchId}</span>
      </div>
      <div>
        Cached: <span id="cache-status">{cached ? 'yes' : 'no'}</span>
      </div>
      <div>
        Visit events: <span id="visit-events">{events.join(',')}</span>
      </div>
    </div>
  )
}
