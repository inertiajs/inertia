<script module lang="ts">
  declare global {
    interface Window {
      _http_handler_messages: string[]
      _http_handler_unsubscribers: (() => void)[]
    }
  }
</script>

<script lang="ts">
  import { router, http } from '@inertiajs/svelte'
  import { onDestroy, onMount } from 'svelte'

  onMount(() => {
    window._http_handler_messages = window._http_handler_messages || []
    window._http_handler_unsubscribers = window._http_handler_unsubscribers || []
  })

  const registerRequestHandler = () => {
    const off = http.onRequest((config) => {
      window._http_handler_messages.push('request-handler-called')

      return {
        ...config,
        headers: { ...config.headers, 'X-Custom-Header': 'custom-value' },
      }
    })

    window._http_handler_unsubscribers.push(off)
  }

  const registerResponseHandler = () => {
    const off = http.onResponse((response) => {
      window._http_handler_messages.push(`response-handler-called:${response.status}`)

      return response
    })

    window._http_handler_unsubscribers.push(off)
  }

  const registerErrorHandler = () => {
    const off = http.onError((error) => {
      window._http_handler_messages.push(`error-handler-called:${error.name}`)
    })

    window._http_handler_unsubscribers.push(off)
  }

  const registerParamsHandler = () => {
    const off = http.onRequest((config) => {
      window._http_handler_messages.push('params-handler-called')

      return {
        ...config,
        params: { foo: 'bar', baz: 'qux' },
      }
    })

    window._http_handler_unsubscribers.push(off)
  }

  const unregisterAll = () => {
    window._http_handler_unsubscribers.forEach((fn) => fn())
    window._http_handler_unsubscribers = []
    window._http_handler_messages.push('unregistered')
  }

  const makeRequest = () => {
    router.get('/dump/get')
  }

  const makeErrorRequest = () => {
    router.get('/http-handlers/error')
  }

  onDestroy(() => window._http_handler_unsubscribers.forEach((fn) => fn()))
</script>

<div>
  <h1>HTTP Handlers</h1>

  <button onclick={registerRequestHandler}>Register Request Handler</button>
  <button onclick={registerResponseHandler}>Register Response Handler</button>
  <button onclick={registerErrorHandler}>Register Error Handler</button>
  <button onclick={registerParamsHandler}>Register Params Handler</button>
  <button onclick={unregisterAll}>Unregister All</button>
  <button onclick={makeRequest}>Make Request</button>
  <button onclick={makeErrorRequest}>Make Error Request</button>
</div>
