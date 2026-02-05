<script setup lang="ts">
import { http, router } from '@inertiajs/vue3'
import { onMounted, onUnmounted } from 'vue'

declare global {
  interface Window {
    _http_handler_messages: string[]
    _http_handler_unsubscribers: (() => void)[]
  }
}

onMounted(() => {
  window._http_handler_messages = window._http_handler_messages || []
  window._http_handler_unsubscribers = window._http_handler_unsubscribers || []
})

function registerRequestHandler() {
  const off = http.onRequest((config) => {
    window._http_handler_messages.push('request-handler-called')

    return {
      ...config,
      headers: { ...config.headers, 'X-Custom-Header': 'custom-value' },
    }
  })

  window._http_handler_unsubscribers.push(off)
}

function registerResponseHandler() {
  const off = http.onResponse((response) => {
    window._http_handler_messages.push(`response-handler-called:${response.status}`)

    return response
  })

  window._http_handler_unsubscribers.push(off)
}

function registerErrorHandler() {
  const off = http.onError((error) => {
    window._http_handler_messages.push(`error-handler-called:${error.name}`)
  })

  window._http_handler_unsubscribers.push(off)
}

function unregisterAll() {
  window._http_handler_unsubscribers.forEach((fn) => fn())
  window._http_handler_unsubscribers = []
  window._http_handler_messages.push('unregistered')
}

function makeRequest() {
  router.get('/dump/get')
}

function makeErrorRequest() {
  router.get('/http-handlers/error')
}

onUnmounted(() => window._http_handler_unsubscribers.forEach((fn) => fn()))
</script>

<template>
  <div>
    <h1>HTTP Handlers</h1>

    <button @click="registerRequestHandler">Register Request Handler</button>
    <button @click="registerResponseHandler">Register Response Handler</button>
    <button @click="registerErrorHandler">Register Error Handler</button>
    <button @click="unregisterAll">Unregister All</button>
    <button @click="makeRequest">Make Request</button>
    <button @click="makeErrorRequest">Make Error Request</button>
  </div>
</template>
