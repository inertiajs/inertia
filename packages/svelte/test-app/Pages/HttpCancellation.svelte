<script module lang="ts">
  declare global {
    interface Window {
      _http_cancellation_log: string[]
    }
  }
</script>

<script lang="ts">
  import { http, router } from '@inertiajs/svelte'
  import { onMount } from 'svelte'

  let messages = $state<string[]>([])

  onMount(() => (window._http_cancellation_log = []))

  const log = (message: string) => {
    window._http_cancellation_log.push(message)
    messages = [...window._http_cancellation_log]
  }

  const requestWithAbortedSignal = async () => {
    const controller = new AbortController()
    const off = http.onError((error) => log(`error:${error.name}`))

    controller.abort()

    try {
      await http.getClient().request({ method: 'get', url: '/dump/get?request=aborted', signal: controller.signal })
      log('outcome:resolved')
    } catch (error) {
      log(`outcome:${(error as Error).name}`)
    } finally {
      off()
    }
  }

  const cancelDuringPreparation = async () => {
    const controller = new AbortController()
    const off = http.onRequest(async (config) => {
      controller.abort()

      return config
    })

    try {
      await http.getClient().request({ method: 'get', url: '/dump/get?request=preparing', signal: controller.signal })
      log('outcome:resolved')
    } catch (error) {
      log(`outcome:${(error as Error).name}`)
    } finally {
      off()
    }
  }

  const visitCancelledBeforeSend = () => {
    router.visit('/dump/get?request=old', {
      async: true,
      onCancelToken: (token) => token.cancel(),
      onCancel: () => log('old:cancel'),
      onFinish: () => log('old:finish'),
      onSuccess: () => log('old:success'),
    })

    router.visit('/dump/get?request=current', {
      async: true,
      onSuccess: () => log('current:success'),
    })
  }

  const prefetchCancelledBeforeSend = () => {
    let off: () => void = () => {}

    off = http.onError((error) => {
      log(`prefetch:${error.name}`)
      off()
    })

    router.prefetch('/dump/get?request=prefetch', { onCancelToken: (token) => token.cancel() })
  }
</script>

<div>
  <h1>HTTP Cancellation</h1>

  <button onclick={requestWithAbortedSignal}>Request With Aborted Signal</button>
  <button onclick={cancelDuringPreparation}>Cancel During Preparation</button>
  <button onclick={visitCancelledBeforeSend}>Visit Cancelled Before Send</button>
  <button onclick={prefetchCancelledBeforeSend}>Prefetch Cancelled Before Send</button>

  <div>
    Log: <span id="log">{messages.join(',')}</span>
  </div>
</div>
