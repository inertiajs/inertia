<script setup lang="ts">
import { Link, router } from '@inertiajs/vue3'
import { ref } from 'vue'

const reloadStatus = ref('idle')

const reload = () => router.reload({ headers: { 'X-Repro-Delay': '1' } })

const visitPage2AndReload = () => {
  router.visit('/async-visits/reload-origin?page=2', { preserveState: true })

  router.reload({
    headers: { 'X-Repro-Delay': '1' },
    onFinish: (visit) => (reloadStatus.value = visit.cancelled ? 'cancelled' : 'finished'),
  })
}

const visitRedirectAndReload = () => {
  router.visit('/async-visits/reload-origin/redirect', { preserveState: true })

  // Browsers hold back an identical GET while one is in flight, so the reload gets its own URL
  router.reload({
    data: { slow: 1 },
    preserveUrl: true,
    headers: { 'X-Repro-Delay': '1' },
    onFinish: (visit) => (reloadStatus.value = visit.cancelled ? 'cancelled' : 'finished'),
  })
}

const postAndReload = () => {
  router.post('/async-visits/reload-origin/like', {}, { preserveState: true })

  // Browsers hold back an identical GET while one is in flight, so the reload gets its own URL
  router.reload({
    data: { slow: 1 },
    preserveUrl: true,
    headers: { 'X-Repro-Delay': '1' },
    onFinish: (visit) => (reloadStatus.value = visit.cancelled ? 'cancelled' : 'finished'),
  })
}

const postToThisPageAndReload = () => {
  router.post('/async-visits/reload-origin')

  router.reload({ headers: { 'X-Repro-Delay': '1' } })
}

const reloadAndReplaceQuery = () => {
  router.reload({
    headers: { 'X-Repro-Delay': '1' },
    onFinish: (visit) => (reloadStatus.value = visit.cancelled ? 'cancelled' : 'finished'),
  })

  router.replace({ url: '/async-visits/reload-origin?page=2', preserveState: true })
}

const visitPage3AsyncAndReplaceQuery = () => {
  router.visit('/async-visits/reload-origin?page=3', {
    async: true,
    preserveState: true,
    headers: { 'X-Repro-Delay': '1' },
  })

  router.replace({ url: '/async-visits/reload-origin?page=2', preserveState: true })
}

const reloadAndPostAsync = () => {
  router.reload({
    headers: { 'X-Repro-Delay': '1' },
    onFinish: (visit) => (reloadStatus.value = visit.cancelled ? 'cancelled' : 'finished'),
  })

  router.post('/async-visits/reload-origin/like', {}, { async: true, preserveState: true })
}
</script>

<template>
  <div>Page: Reload Origin</div>

  <button @click="reload">Reload</button>
  <button @click="visitPage2AndReload">Visit page 2 and reload</button>
  <button @click="reloadAndPostAsync">Reload and post async</button>
  <button @click="visitRedirectAndReload">Visit redirect and reload</button>
  <button @click="postAndReload">Post and reload</button>
  <button @click="postToThisPageAndReload">Post to this page and reload</button>
  <button @click="reloadAndReplaceQuery">Reload and replace query</button>
  <button @click="visitPage3AsyncAndReplaceQuery">Visit page 3 async and replace query</button>
  <Link href="/async-visits/page-c">Go to C</Link>

  <div>Reload: {{ reloadStatus }}</div>
</template>
