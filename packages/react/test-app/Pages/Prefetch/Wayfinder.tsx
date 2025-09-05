import { router } from '@inertiajs/react'
import { useCallback, useEffect, useState } from 'react'

export default function Wayfinder() {
  const [isPrefetched, setIsPrefetched] = useState(false)
  const [isPrefetching, setIsPrefetching] = useState(false)

  const wayfinderUrl = (): {
    url: string
    method: 'get'
  } => ({
    url: '/prefetch/swr/4',
    method: 'get',
  })

  const checkStatus = useCallback(() => {
    setIsPrefetched(!!router.getCached(wayfinderUrl()))
    setIsPrefetching(!!router.getPrefetching(wayfinderUrl()))
  }, [])

  const testPrefetch = () => {
    router.prefetch(wayfinderUrl(), {
      onPrefetching: () => {
        setIsPrefetching(true)
      },
      onPrefetched: () => {
        setIsPrefetching(false)
        setTimeout(checkStatus)
      },
    })
  }

  const testFlush = () => {
    router.flush(wayfinderUrl())
    checkStatus()
  }

  const flushAll = () => {
    router.flushAll()
    checkStatus()
  }

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  return (
    <div>
      <p>
        Is Prefetched: <span id="is-prefetched">{isPrefetched.toString()}</span>
      </p>
      <p>
        Is Prefetching: <span id="is-prefetching">{isPrefetching.toString()}</span>
      </p>

      <button onClick={testPrefetch} id="test-prefetch">
        Test prefetch
      </button>
      <button onClick={testFlush} id="test-flush">
        Test flush
      </button>
      <button onClick={flushAll} id="flush-all">
        Flush all
      </button>
    </div>
  )
}
