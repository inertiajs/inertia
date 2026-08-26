<script setup lang="ts">
import { Head, router, useHttp, useProp } from '@inertiajs/vue3'
import { onMounted, onUnmounted, ref } from 'vue'

defineProps<{
  order: { id: number; reference: string; status: string; total: number; updated_at: string }
  stats: { orders: number; revenue: number }
  activity: { at: string; message: string }[]
  renderedAt: string
  socketIdHeader: string | null
}>()

type LivePayload = { __inertia?: { props?: Record<string, unknown> } }

const { loading: orderLoading } = useProp('order')
const { loading: activityLoading } = useProp('activity')

const triggeredAt = ref('never')
const reloads = ref(0)
const events = ref(0)
const lastRequest = ref('none')
const log = ref<{ id: number; line: string }[]>([])

let logId = 0

const stamp = () => new Date().toLocaleTimeString('en-GB', { hour12: false })

const note = (message: string) => {
  log.value = [{ id: ++logId, line: `${stamp()} ${message}` }, ...log.value].slice(0, 12)
}

// A plain HTTP call rather than a visit, so it never touches the page. Every
// Inertia request the demo makes from here on is a live reload and nothing else
const triggers = useHttp<Record<string, never>, { triggeredAt: string }>({})

const trigger = (url: string) =>
  triggers.post(url).then((response) => {
    triggeredAt.value = response.triggeredAt
  })

let stopListeners: VoidFunction[] = []

onMounted(() => {
  stopListeners = [
    router.on('live', (event) => {
      events.value++

      const carried = Object.keys((event.detail.payload as LivePayload)?.__inertia?.props ?? {})
      const how = carried.length > 0 ? `carrying [${carried.join(', ')}]` : 'carrying nothing'

      note(`event ${event.detail.event.split('\\').pop()} to [${event.detail.props.join(', ')}] ${how}`)
    }),
    router.on('start', (event) => {
      const { only, reset, prefetch } = event.detail.visit
      const requested = [...only, ...reset]

      // A full page load asks for nothing in particular, and a prefetch is
      // aimed at another page, so neither is a live reload
      if (prefetch || requested.length === 0) {
        return
      }

      reloads.value++
      lastRequest.value = `only=[${requested.join(', ')}]`
      note(`live reload only=[${requested.join(', ')}]`)
    }),
  ]
})

onUnmounted(() => {
  stopListeners.forEach((stop) => stop())
  stopListeners = []
})
</script>

<template>
  <Head title="Live Props" />

  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Live props over Reverb</h1>
      <p class="mt-1 text-slate-600">
        Open this page in two windows side by side. Everything below updates without a page reload.
      </p>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <div class="rounded-lg border-2 p-4" :class="orderLoading ? 'border-amber-400 bg-amber-50' : 'border-slate-200'">
        <div class="flex items-center justify-between">
          <h2 class="font-semibold">order</h2>
          <span v-if="orderLoading" class="text-sm text-amber-700">refreshing…</span>
        </div>
        <dl class="mt-2 space-y-1 text-sm">
          <div><span class="text-slate-500">reference</span> {{ order.reference }}</div>
          <div>
            <span class="text-slate-500">status</span>
            <span class="font-mono font-bold">{{ order.status }}</span>
          </div>
          <div><span class="text-slate-500">total</span> {{ order.total }}</div>
          <div><span class="text-slate-500">changed at</span> {{ order.updated_at }}</div>
        </dl>
      </div>

      <div class="rounded-lg border-2 border-slate-200 p-4">
        <h2 class="font-semibold">stats</h2>
        <p class="mt-1 text-xs text-slate-500">Same channel and event as the order, so both refresh in one request.</p>
        <dl class="mt-2 space-y-1 text-sm">
          <div><span class="text-slate-500">orders</span> {{ stats.orders }}</div>
          <div><span class="text-slate-500">revenue</span> {{ stats.revenue }}</div>
        </dl>
      </div>

      <div
        class="rounded-lg border-2 p-4"
        :class="activityLoading ? 'border-amber-400 bg-amber-50' : 'border-slate-200'"
      >
        <div class="flex items-center justify-between">
          <h2 class="font-semibold">activity</h2>
          <span v-if="activityLoading" class="text-sm text-amber-700">refreshing…</span>
        </div>
        <p class="mt-1 text-xs text-slate-500">Throttled to 4s by the manifest.</p>
        <ul class="mt-2 space-y-1 text-sm">
          <li v-for="entry in activity" :key="entry.at + entry.message" class="font-mono text-xs">
            {{ entry.at }} {{ entry.message }}
          </li>
        </ul>
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <button class="rounded bg-slate-800 px-4 py-2 text-white" @click="trigger('/live/order')">
        Broadcast to everyone
      </button>
      <button class="rounded bg-indigo-700 px-4 py-2 text-white" @click="trigger('/live/order-with-payload')">
        Advance order (payload, no reload)
      </button>
      <button class="rounded bg-emerald-700 px-4 py-2 text-white" @click="trigger('/live/order-to-others')">
        Broadcast toOthers()
      </button>
      <button class="rounded bg-slate-800 px-4 py-2 text-white" @click="trigger('/live/activity')">
        Broadcast activity
      </button>
      <button class="rounded bg-slate-800 px-4 py-2 text-white" @click="trigger('/live/both')">
        Broadcast both events
      </button>
      <button class="rounded bg-slate-800 px-4 py-2 text-white" @click="trigger('/live/burst')">Burst of 8</button>
      <button class="rounded border border-slate-300 px-4 py-2" @click="router.live.refresh('order')">
        Refresh order
      </button>
      <button class="rounded border border-slate-300 px-4 py-2" @click="trigger('/live/reset')">Reset</button>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <dl class="rounded-lg bg-slate-100 p-4 text-sm">
        <div>
          <span class="text-slate-500">page rendered at</span> <b>{{ renderedAt }}</b> (never changes here)
        </div>
        <div><span class="text-slate-500">last trigger at</span> {{ triggeredAt }}</div>
        <div><span class="text-slate-500">socket id the server saw</span> {{ socketIdHeader ?? 'none' }}</div>
        <div><span class="text-slate-500">broadcast events received</span> {{ events }}</div>
        <div><span class="text-slate-500">live reloads</span> {{ reloads }}</div>
        <div>
          <span class="text-slate-500">last live request</span> <code>{{ lastRequest }}</code>
        </div>
      </dl>

      <div class="rounded-lg bg-slate-900 p-4 font-mono text-xs text-slate-100">
        <div v-for="entry in log" :key="entry.id">{{ entry.line }}</div>
        <div v-if="log.length === 0">waiting for events…</div>
      </div>
    </div>
  </div>
</template>
