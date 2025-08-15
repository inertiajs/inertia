<script setup lang="ts">
import { router } from '@inertiajs/vue3'
import { onMounted, ref } from 'vue'

const isPrefetched = ref(false)
const isPrefetching = ref(false)

const wayfinderUrl = (): {
  url: string
  method: 'get'
} => ({
  url: '/prefetch/swr/4',
  method: 'get',
})

const checkStatus = () => {
  isPrefetched.value = !!router.getCached(wayfinderUrl())
  isPrefetching.value = !!router.getPrefetching(wayfinderUrl())
}

const testPrefetch = () => {
  router.prefetch(
    wayfinderUrl(),
    {
      onPrefetching: () => {
        isPrefetching.value = true
      },
      onPrefetched: () => {
        isPrefetching.value = false
        setTimeout(checkStatus)
      },
    },
    { cacheFor: 5000 },
  )
}

const testFlush = () => {
  router.flush(wayfinderUrl())
  checkStatus()
}

const flushAll = () => {
  router.flushAll()
  checkStatus()
}

onMounted(checkStatus)
</script>

<template>
  <div>
    <p>
      Is Prefetched: <span id="is-prefetched">{{ isPrefetched }}</span>
    </p>
    <p>
      Is Prefetching: <span id="is-prefetching">{{ isPrefetching }}</span>
    </p>

    <button @click="testPrefetch" id="test-prefetch">Test prefetch</button>
    <button @click="testFlush" id="test-flush">Test flush</button>
    <button @click="flushAll" id="flush-all">Flush all</button>
  </div>
</template>
