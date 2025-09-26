<script lang="ts">
  import { Form } from '@inertiajs/svelte5'

  let events: string[] = []
  let cancelInOnBefore = false
  let shouldFail = false
  let shouldDelay = false
  let cancelToken: { cancel: () => void } | null = null

  function log(eventName: string) {
    events = [...events, eventName]
  }

  $: action = (() => {
    if (shouldFail) {
      return '/form-component/events/errors'
    }

    if (shouldDelay) {
      return '/form-component/events/delay'
    }

    return '/form-component/events/success'
  })()

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
  {onCancelToken}
>
  {#snippet children({ processing, progress, wasSuccessful, recentlySuccessful })}
    <h1>Form Events & State</h1>

    <div>
      Events: <span id="events">{events.join(',')}</span>
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
      <button type="button" on:click={() => (cancelInOnBefore = true)}>Cancel in onBefore</button>
      <button type="button" on:click={() => (shouldFail = true)}>Fail Request</button>
      <button type="button" on:click={() => (shouldDelay = true)}>Should Delay</button>
      <button type="button" on:click={cancelVisit}>Cancel Visit</button>
      <button type="submit">Submit</button>
    </div>
  {/snippet}
</Form>
