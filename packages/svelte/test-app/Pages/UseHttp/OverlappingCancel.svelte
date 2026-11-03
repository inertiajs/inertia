<script lang="ts">
  import type { CancelToken } from '@inertiajs/core'
  import { useHttp } from '@inertiajs/svelte'

  const http = useHttp<Record<string, never>, { result: string }>({})
  let tokenA: CancelToken | null = null
  let log = $state<string[]>([])

  const start = (name: string, delay: number, keepToken = false) => {
    http
      .get(`/api/delayed?name=${name}&delay=${delay}`, {
        onCancelToken: (token) => {
          if (keepToken) {
            tokenA = token
          }
        },
      })
      .then(() => (log = [...log, `${name}: done`]))
      .catch((error) => (log = [...log, `${name}: ${error.name}`]))
  }

  const startShortThenLong = () => {
    start('a', 100)
    start('b', 2000)
  }

  const startBothLong = () => {
    start('a', 2000, true)
    start('b', 2000)
  }
</script>

<div>
  <h1>useHttp Overlapping Cancel Test</h1>

  <button id="short-then-long-button" onclick={startShortThenLong}>Start short A, then long B</button>
  <button id="both-long-button" onclick={startBothLong}>Start long A, then long B</button>
  <button id="cancel-button" onclick={() => http.cancel()}>Cancel</button>
  <button id="cancel-a-button" onclick={() => tokenA?.cancel()}>Cancel A by its token</button>
  <div id="log">{log.join(', ')}</div>
</div>
