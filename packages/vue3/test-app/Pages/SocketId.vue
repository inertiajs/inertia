<script setup lang="ts">
import { router, socketId } from '@inertiajs/vue3'
import { onUnmounted, ref } from 'vue'

defineProps<{ socketIdHeader: string | null }>()

const resolved = ref<string | null>(null)

function registerResolver() {
  socketId.resolveUsing(() => 'socket-abc-123')
  resolved.value = socketId.resolve()
}

function registerEmptyResolver() {
  socketId.resolveUsing(() => null)
  resolved.value = socketId.resolve()
}

function clearResolver() {
  socketId.resolveUsing(null)
  resolved.value = socketId.resolve()
}

function reload() {
  router.reload({ only: ['socketIdHeader'] })
}

function visitDump() {
  router.get('/dump/get')
}

function visitDumpWithOwnSocketId() {
  router.get('/dump/get', {}, { headers: { 'X-Socket-ID': 'socket-set-by-app' } })
}

onUnmounted(() => socketId.resolveUsing(null))
</script>

<template>
  <div>
    <h1>Socket Id</h1>

    <p>
      Resolved socket id: <span id="resolved">{{ resolved ?? 'none' }}</span>
    </p>
    <p>
      Header received by the server: <span id="header">{{ socketIdHeader ?? 'none' }}</span>
    </p>

    <button @click="registerResolver">Register Resolver</button>
    <button @click="registerEmptyResolver">Register Empty Resolver</button>
    <button @click="clearResolver">Clear Resolver</button>
    <button @click="reload">Reload</button>
    <button @click="visitDump">Visit Dump Page</button>
    <button @click="visitDumpWithOwnSocketId">Send Own Socket Id</button>
  </div>
</template>
