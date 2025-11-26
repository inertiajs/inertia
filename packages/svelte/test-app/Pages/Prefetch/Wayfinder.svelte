<script lang="ts">
  import { router } from '@inertiajs/svelte'
  import { onMount } from 'svelte'

  let isPrefetched = $state(false)
  let isPrefetching = $state(false)

  const wayfinderUrl = (): {
    url: string
    method: 'get'
  } => ({
    url: '/prefetch/swr/4',
    method: 'get',
  })

  const checkStatus = () => {
    isPrefetched = !!router.getCached(wayfinderUrl())
    isPrefetching = !!router.getPrefetching(wayfinderUrl())
  }

  const testPrefetch = () => {
    router.prefetch(wayfinderUrl(), {
      onPrefetching: () => {
        isPrefetching = true
      },
      onPrefetched: () => {
        isPrefetching = false
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

  onMount(checkStatus)
</script>

<div>
  <p>
    Is Prefetched: <span id="is-prefetched">{isPrefetched}</span>
  </p>
  <p>
    Is Prefetching: <span id="is-prefetching">{isPrefetching}</span>
  </p>

  <button onclick={testPrefetch} id="test-prefetch">Test prefetch</button>
  <button onclick={testFlush} id="test-flush">Test flush</button>
  <button onclick={flushAll} id="flush-all">Flush all</button>
</div>
