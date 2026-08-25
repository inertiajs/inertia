<script setup lang="ts">
import { Link, router } from '@inertiajs/vue3'
import { onMounted, onUnmounted, ref } from 'vue'

defineProps<{
  order: string
  stats: string
  feed: string
  throttled: string
  notes: string
  multi: string
  plain: string
  account: { balance: string }
  socketIdHeader: string | null
}>()

const events = ref(0)
const lastEvent = ref('none')
const cancel = ref(false)
const subscriptions = ref<string[]>([])

const showSubscriptions = () => {
  subscriptions.value = window.__inertiaLive.subscriptions()
}

let stopListening: VoidFunction | null = null

onMounted(() => {
  showSubscriptions()

  stopListening = router.on('live', (event) => {
    events.value++

    lastEvent.value = [
      event.detail.channel.type,
      event.detail.channel.name,
      event.detail.event,
      event.detail.props.join('|'),
      JSON.stringify(event.detail.payload),
    ].join(' ')

    if (cancel.value) {
      return false
    }
  })
})

onUnmounted(() => {
  stopListening?.()
  stopListening = null
})
</script>

<template>
  <div>
    <h1>Live Props</h1>

    <dl>
      <dt>order</dt>
      <dd id="order">{{ order }}</dd>

      <dt>stats</dt>
      <dd id="stats">{{ stats }}</dd>

      <dt>feed</dt>
      <dd id="feed">{{ feed }}</dd>

      <dt>throttled</dt>
      <dd id="throttled">{{ throttled }}</dd>

      <dt>notes</dt>
      <dd id="notes">{{ notes }}</dd>

      <dt>multi</dt>
      <dd id="multi">{{ multi }}</dd>

      <dt>plain</dt>
      <dd id="plain">{{ plain }}</dd>

      <dt>account.balance</dt>
      <dd id="account-balance">{{ account.balance }}</dd>

      <dt>socket id header</dt>
      <dd id="socket-id-header">{{ socketIdHeader ?? 'none' }}</dd>

      <dt>events</dt>
      <dd id="events">{{ events }}</dd>

      <dt>last event</dt>
      <dd id="last-event">{{ lastEvent }}</dd>

      <dt>subscriptions</dt>
      <dd id="subscriptions">{{ subscriptions.join(', ') || 'none' }}</dd>

      <dt>subscription count</dt>
      <dd id="subscription-count">{{ subscriptions.length }}</dd>
    </dl>

    <button @click="showSubscriptions">Show Subscriptions</button>
    <button @click="cancel = !cancel">Toggle Cancel</button>
    <button @click="router.live.pause()">Pause</button>
    <button @click="router.live.resume()">Resume</button>
    <button @click="router.live.refresh('order')">Refresh Order</button>
    <button @click="router.live.refresh('throttled')">Refresh Throttled</button>
    <button @click="router.reload({ only: ['plain'] })">Reload Plain</button>

    <Link href="/socket-id">Leave</Link>
  </div>
</template>
