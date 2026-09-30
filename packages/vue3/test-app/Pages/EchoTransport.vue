<script setup lang="ts">
import { Link, router } from '@inertiajs/vue3'
import { onMounted, ref } from 'vue'

defineProps<{
  order: string
  stats: string
  room: string
  secret: string
  news: string
  socketIdHeader: string | null
}>()

const log = ref<string[]>([])

const showLog = () => {
  log.value = window.__inertiaEcho?.log() ?? []
}

onMounted(showLog)
</script>

<template>
  <div>
    <h1>Echo Transport</h1>

    <dl>
      <dt>order</dt>
      <dd id="order">{{ order }}</dd>

      <dt>stats</dt>
      <dd id="stats">{{ stats }}</dd>

      <dt>room</dt>
      <dd id="room">{{ room }}</dd>

      <dt>secret</dt>
      <dd id="secret">{{ secret }}</dd>

      <dt>news</dt>
      <dd id="news">{{ news }}</dd>

      <dt>socket id header</dt>
      <dd id="socket-id-header">{{ socketIdHeader ?? 'none' }}</dd>
    </dl>

    <pre id="log">{{ log.join('\n') }}</pre>

    <button @click="showLog">Show Log</button>
    <button @click="router.reload({ data: { drop: 'stats' } })">Drop Stats</button>
    <button @click="router.reload({ data: { swap: '1' } })">Swap Events</button>

    <Link href="/socket-id">Leave</Link>
  </div>
</template>
