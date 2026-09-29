<script setup lang="ts">
import { http, router } from '@inertiajs/vue3'
import { onMounted, ref } from 'vue'

declare global {
  interface Window {
    _http_cancellation_log: string[]
  }
}

const messages = ref<string[]>([])

onMounted(() => (window._http_cancellation_log = []))

const log = (message: string) => {
  window._http_cancellation_log.push(message)
  messages.value = [...window._http_cancellation_log]
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

<template>
  <div>
    <h1>HTTP Cancellation</h1>

    <button @click="requestWithAbortedSignal">Request With Aborted Signal</button>
    <button @click="cancelDuringPreparation">Cancel During Preparation</button>
    <button @click="visitCancelledBeforeSend">Visit Cancelled Before Send</button>
    <button @click="prefetchCancelledBeforeSend">Prefetch Cancelled Before Send</button>

    <div>
      Log: <span id="log">{{ messages.join(',') }}</span>
    </div>
  </div>
</template>
