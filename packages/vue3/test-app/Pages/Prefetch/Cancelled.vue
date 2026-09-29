<script setup lang="ts">
import { router } from '@inertiajs/vue3'
import { onMounted, onUnmounted, ref } from 'vue'

const url = '/prefetch/swr/1'

const prefetchId = ref('')
const cached = ref(false)
const events = ref<string[]>([])

let cancelToken: { cancel: () => void } | null = null

const refresh = () => {
  prefetchId.value = router.getPrefetching(url)?.params.id ?? ''
  cached.value = router.getCached(url) !== null
}

let timer: ReturnType<typeof setInterval>

onMounted(() => {
  timer = setInterval(refresh, 50)
})

onUnmounted(() => clearInterval(timer))

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
    onCancel: () => events.value.push('cancel'),
    onFinish: () => events.value.push('finish'),
    onSuccess: () => events.value.push('success'),
  })
}
</script>

<template>
  <div>
    <button @click="prefetch">Prefetch</button>
    <button @click="prefetchWithReplacement">Prefetch With Replacement</button>
    <button @click="prefetchAndCancel">Prefetch And Cancel</button>
    <button @click="prefetchAndCancelWithReplacement">Prefetch And Cancel With Replacement</button>
    <button @click="cancelPrefetch">Cancel Prefetch</button>

    <button @click="router.flush(url)">Flush</button>
    <button @click="router.flushByCacheTags('example')">Flush By Cache Tags</button>
    <button @click="router.flushAll()">Flush All</button>

    <button @click="visit">Visit</button>

    <div>
      Prefetching: <span id="prefetch-status">{{ prefetchId ? 'yes' : 'no' }}</span>
    </div>
    <div>
      Prefetch ID: <span id="prefetch-id">{{ prefetchId }}</span>
    </div>
    <div>
      Cached: <span id="cache-status">{{ cached ? 'yes' : 'no' }}</span>
    </div>
    <div>
      Visit events: <span id="visit-events">{{ events.join(',') }}</span>
    </div>
  </div>
</template>
