import { CancelToken } from '@inertiajs/core'
import { useHttp } from '@inertiajs/react'
import { useRef, useState } from 'react'

export default () => {
  const http = useHttp<Record<string, never>, { result: string }>({})
  const tokenA = useRef<CancelToken | null>(null)
  const [log, setLog] = useState<string[]>([])

  const start = (name: string, delay: number, keepToken = false) => {
    http
      .get(`/api/delayed?name=${name}&delay=${delay}`, {
        onCancelToken: (token) => {
          if (keepToken) {
            tokenA.current = token
          }
        },
      })
      .then(() => setLog((all) => [...all, `${name}: done`]))
      .catch((error) => setLog((all) => [...all, `${name}: ${error.name}`]))
  }

  return (
    <div>
      <h1>useHttp Overlapping Cancel Test</h1>

      <button
        id="short-then-long-button"
        onClick={() => {
          start('a', 100)
          start('b', 2000)
        }}
      >
        Start short A, then long B
      </button>
      <button
        id="both-long-button"
        onClick={() => {
          start('a', 2000, true)
          start('b', 2000)
        }}
      >
        Start long A, then long B
      </button>
      <button id="cancel-button" onClick={() => http.cancel()}>
        Cancel
      </button>
      <button id="cancel-a-button" onClick={() => tokenA.current?.cancel()}>
        Cancel A by its token
      </button>
      <div id="log">{log.join(', ')}</div>
    </div>
  )
}
