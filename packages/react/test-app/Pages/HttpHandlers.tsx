import { http, router } from '@inertiajs/react'
import { useEffect } from 'react'

declare global {
  interface Window {
    _http_handler_messages: string[]
    _http_handler_unsubscribers: (() => void)[]
  }
}

export default () => {
  useEffect(() => {
    window._http_handler_messages = window._http_handler_messages || []
    window._http_handler_unsubscribers = window._http_handler_unsubscribers || []

    return () => window._http_handler_unsubscribers.forEach((fn) => fn())
  }, [])

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

  return (
    <div>
      <h1>HTTP Handlers</h1>

      <button onClick={registerRequestHandler}>Register Request Handler</button>
      <button onClick={registerResponseHandler}>Register Response Handler</button>
      <button onClick={registerErrorHandler}>Register Error Handler</button>
      <button onClick={unregisterAll}>Unregister All</button>
      <button onClick={makeRequest}>Make Request</button>
      <button onClick={makeErrorRequest}>Make Error Request</button>
    </div>
  )
}
