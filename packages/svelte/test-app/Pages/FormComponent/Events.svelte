<script lang="ts">
  import { Form } from '@inertiajs/svelte'
  import { onMount } from 'svelte'

  let events: string[] = $state([])
  let globalEvents: string[] = $state([])
  let flashData = $state('')
  let cancelInOnBefore = $state(false)
  let preventErrorEvents = $state(false)
  let action = $state('/form-component/events/success')
  let cancelToken: { cancel: () => void } | null = null

  function log(eventName: string) {
    events = [...events, eventName]
  }

  function onBefore() {
    log('onBefore')

    if (cancelInOnBefore) {
      log('onCancel')
      return false
    }
  }

  function onStart() {
    log('onStart')
  }

  function onProgress() {
    log('onProgress')
  }

  function onFinish() {
    log('onFinish')
  }

  function onCancel() {
    log('onCancel')
  }

  function onSuccess() {
    log('onSuccess')
  }

  function onError() {
    log('onError')
  }

  function onHttpException() {
    log('onHttpException')

    if (preventErrorEvents) {
      return false
    }
  }

  function onNetworkError() {
    log('onNetworkError')

    if (preventErrorEvents) {
      return false
    }
  }

  function onFlash(flash: Record<string, unknown>) {
    log('onFlash')
    flashData = JSON.stringify(flash)
  }

  function onCancelToken(token: { cancel: () => void }) {
    log('onCancelToken')
    cancelToken = token
  }

  function cancelVisit() {
    if (cancelToken) {
      cancelToken.cancel()
      cancelToken = null
    }
  }

  onMount(() => {
    const logGlobalEvent = (name: string) => () => (globalEvents = [...globalEvents, name])

    const httpExceptionListener = logGlobalEvent('httpException')
    const networkErrorListener = logGlobalEvent('networkError')

    document.addEventListener('inertia:httpException', httpExceptionListener)
    document.addEventListener('inertia:networkError', networkErrorListener)

    return () => {
      document.removeEventListener('inertia:httpException', httpExceptionListener)
      document.removeEventListener('inertia:networkError', networkErrorListener)
    }
  })
</script>

<Form
  {action}
  method="post"
  {onBefore}
  {onStart}
  {onProgress}
  {onFinish}
  {onCancel}
  {onSuccess}
  {onError}
  {onHttpException}
  {onNetworkError}
  {onFlash}
  {onCancelToken}
>
  {#snippet children({ processing, progress, wasSuccessful, recentlySuccessful, cancel })}
    <h1>Form Events & State</h1>

    <div>
      Events: <span id="events">{events.join(',')}</span>
    </div>

    <div>
      Global events: <span id="global-events">{globalEvents.join(',')}</span>
    </div>

    <div>
      Flash: <span id="flash">{flashData}</span>
    </div>

    <div>
      Processing: <span id="processing">{String(processing)}</span>
    </div>

    <div>
      Progress: <span id="progress" class={progress?.percentage ? 'uploading' : ''}>
        {progress?.percentage || 0}
      </span>
    </div>

    <div>
      Was successful: <span id="was-successful">{String(wasSuccessful)}</span>
    </div>

    <div>
      Recently successful: <span id="recently-successful">{String(recentlySuccessful)}</span>
    </div>

    <div>
      <input type="file" name="avatar" id="avatar" />
    </div>

    <div>
      <button type="button" onclick={() => (cancelInOnBefore = true)}>Cancel in onBefore</button>
      <button type="button" onclick={() => (action = '/form-component/events/errors')}>Fail Request</button>
      <button type="button" onclick={() => (action = '/form-component/events/delay')}>Should Delay</button>
      <button type="button" onclick={() => (action = '/form-component/events/flash')}>Return Flash</button>
      <button type="button" onclick={() => (action = '/non-inertia')}>Trigger HTTP Exception</button>
      <button type="button" onclick={() => (action = '/disconnect')}>Trigger Network Error</button>
      <button type="button" onclick={() => (preventErrorEvents = true)}>Prevent Error Events</button>
      <button type="button" onclick={cancelVisit}>Cancel Visit</button>
      <button type="button" onclick={cancel}>Cancel Submission</button>
      <button type="submit">Submit</button>
    </div>
  {/snippet}
</Form>
