<script module lang="ts">
  declare global {
    interface Window {
      _http_cancellation_log: string[]
    }
  }
</script>

<script lang="ts">
  import { http, router } from '@inertiajs/svelte'

  window._http_cancellation_log = []

  let messages = $state<string[]>([])

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

    let release!: () => void
    let entered!: () => void
    const blocked = new Promise<void>((resolve) => (release = resolve))
    const started = new Promise<void>((resolve) => (entered = resolve))

    const off = http.onRequest(async (config) => {
      entered()
      await blocked

      return config
    })

    const outcome = http
      .getClient()
      .request({ method: 'get', url: '/dump/get?request=preparing', signal: controller.signal })
      .then(
        () => 'resolved',
        (error: Error) => error.name,
      )

    await started
    controller.abort()
    release()

    log(`outcome:${await outcome}`)
    off()
  }

  let startedController: AbortController | null = null

  const startLongRequest = async () => {
    startedController = new AbortController()

    const outcome = await http
      .getClient()
      .request({ method: 'get', url: '/dump/get?request=started', signal: startedController.signal })
      .then(
        () => 'resolved',
        (error: Error) => error.name,
      )

    log(`outcome:${outcome}`)
  }

  const cancelStartedRequest = () => {
    startedController?.abort()
    startedController = null
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
  <button onclick={startLongRequest}>Start Long Request</button>
  <button onclick={cancelStartedRequest}>Cancel Started Request</button>
  <button onclick={visitCancelledBeforeSend}>Visit Cancelled Before Send</button>
  <button onclick={prefetchCancelledBeforeSend}>Prefetch Cancelled Before Send</button>

  <div>
    Log: <span id="log">{messages.join(',')}</span>
  </div>
</div>
