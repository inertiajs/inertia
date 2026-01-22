<script lang="ts">
  import { useHttp } from '@inertiajs/svelte'

  interface LifecycleResponse {
    success: boolean
    message: string
    received: Record<string, unknown>
  }

  const lifecycleTest = useHttp<{ value: string }, LifecycleResponse>({
    value: '',
  })

  const lifecycleErrorTest = useHttp<{ value: string }, LifecycleResponse>({
    value: '',
  })

  const onBeforeCancelTest = useHttp<{ value: string }, LifecycleResponse>({
    value: '',
  })

  let lifecycleEvents: string[] = $state([])
  let lifecycleErrorEvents: string[] = $state([])
  let onBeforeCancelled = $state(false)

  const performLifecycleTest = async () => {
    lifecycleEvents = []
    try {
      await lifecycleTest.post('/api/lifecycle', {
        onBefore: () => {
          lifecycleEvents = [...lifecycleEvents, 'onBefore']
        },
        onStart: () => {
          lifecycleEvents = [...lifecycleEvents, 'onStart']
        },
        onSuccess: () => {
          lifecycleEvents = [...lifecycleEvents, 'onSuccess']
        },
        onError: () => {
          lifecycleEvents = [...lifecycleEvents, 'onError']
        },
        onFinish: () => {
          lifecycleEvents = [...lifecycleEvents, 'onFinish']
        },
      })
    } catch {
      // Error handling
    }
  }

  const performLifecycleErrorTest = async () => {
    lifecycleErrorEvents = []
    try {
      await lifecycleErrorTest.post('/api/lifecycle-error', {
        onBefore: () => {
          lifecycleErrorEvents = [...lifecycleErrorEvents, 'onBefore']
        },
        onStart: () => {
          lifecycleErrorEvents = [...lifecycleErrorEvents, 'onStart']
        },
        onSuccess: () => {
          lifecycleErrorEvents = [...lifecycleErrorEvents, 'onSuccess']
        },
        onError: () => {
          lifecycleErrorEvents = [...lifecycleErrorEvents, 'onError']
        },
        onFinish: () => {
          lifecycleErrorEvents = [...lifecycleErrorEvents, 'onFinish']
        },
      })
    } catch {
      // Expected error
    }
  }

  const performOnBeforeCancelTest = async () => {
    onBeforeCancelled = false
    try {
      await onBeforeCancelTest.post('/api/lifecycle', {
        onBefore: () => {
          onBeforeCancelled = true
          return false
        },
      })
    } catch {
      // Should not reach here
    }
  }
</script>

<div>
  <h1>useHttp Lifecycle Callbacks Test</h1>

  <!-- Lifecycle Callbacks Test -->
  <section id="lifecycle-test">
    <h2>Lifecycle Callbacks</h2>
    <label>
      Value
      <input type="text" id="lifecycle-value" bind:value={lifecycleTest.value} />
    </label>
    <button onclick={performLifecycleTest} id="lifecycle-button">Test Lifecycle (Success)</button>
    <button onclick={performLifecycleErrorTest} id="lifecycle-error-button">Test Lifecycle (Error)</button>
    <button onclick={performOnBeforeCancelTest} id="lifecycle-cancel-button">Test onBefore Cancel</button>
    <div id="lifecycle-events">Events: {lifecycleEvents.join(', ')}</div>
    <div id="lifecycle-error-events">Error Events: {lifecycleErrorEvents.join(', ')}</div>
    {#if onBeforeCancelled}
      <div id="lifecycle-cancelled">onBefore returned false - request cancelled</div>
    {/if}
    {#if onBeforeCancelTest.processing}
      <div id="lifecycle-cancel-processing">Processing...</div>
    {/if}
  </section>
</div>
