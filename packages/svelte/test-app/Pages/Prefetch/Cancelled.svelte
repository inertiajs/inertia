<script lang="ts">
  import { router } from '@inertiajs/svelte'

  const url = '/prefetch/swr/1'

  let prefetchId = $state('')
  let cached = $state(false)
  let events = $state<string[]>([])

  let cancelToken: { cancel: () => void } | null = null

  $effect(() => {
    const timer = setInterval(() => {
      prefetchId = router.getPrefetching(url)?.params.id ?? ''
      cached = router.getCached(url) !== null
    }, 50)

    return () => clearInterval(timer)
  })

  const prefetch = () => {
    router.prefetch(url, { onCancelToken: (token) => (cancelToken = token) }, { cacheTags: ['example'] })
  }

  const prefetchWithReplacement = () => {
    router.prefetch(url, {
      onCancelToken: (token) => (cancelToken = token),
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
    cancelToken?.cancel()
    cancelToken = null
  }

  const visit = () => {
    router.visit(url, {
      onCancel: () => (events = [...events, 'cancel']),
      onFinish: () => (events = [...events, 'finish']),
      onSuccess: () => (events = [...events, 'success']),
    })
  }
</script>

<div>
  <button onclick={prefetch}>Prefetch</button>
  <button onclick={prefetchWithReplacement}>Prefetch With Replacement</button>
  <button onclick={prefetchAndCancel}>Prefetch And Cancel</button>
  <button onclick={prefetchAndCancelWithReplacement}>Prefetch And Cancel With Replacement</button>
  <button onclick={cancelPrefetch}>Cancel Prefetch</button>

  <button onclick={() => router.flush(url)}>Flush</button>
  <button onclick={() => router.flushByCacheTags('example')}>Flush By Cache Tags</button>
  <button onclick={() => router.flushAll()}>Flush All</button>

  <button onclick={visit}>Visit</button>

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
