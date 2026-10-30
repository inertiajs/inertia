<script setup lang="ts">
import { CancelToken } from '@inertiajs/core'
import { useHttp } from '@inertiajs/vue3'
import { ref } from 'vue'

const http = useHttp<Record<string, never>, { result: string }>({})
let tokenA: CancelToken | null = null
const log = ref<string[]>([])

const start = (name: string, delay: number, keepToken = false) => {
  http
    .get(`/api/delayed?name=${name}&delay=${delay}`, {
      onCancelToken: (token) => {
        if (keepToken) {
          tokenA = token
        }
      },
    })
    .then(() => log.value.push(`${name}: done`))
    .catch((error) => log.value.push(`${name}: ${error.name}`))
}

const startShortThenLong = () => {
  start('a', 100)
  start('b', 2000)
}

const startBothLong = () => {
  start('a', 2000, true)
  start('b', 2000)
}

const cancelA = () => tokenA?.cancel()
</script>

<template>
  <div>
    <h1>useHttp Overlapping Cancel Test</h1>

    <button id="short-then-long-button" @click="startShortThenLong">Start short A, then long B</button>
    <button id="both-long-button" @click="startBothLong">Start long A, then long B</button>
    <button id="cancel-button" @click="http.cancel()">Cancel</button>
    <button id="cancel-a-button" @click="cancelA">Cancel A by its token</button>
    <div id="log">{{ log.join(', ') }}</div>
  </div>
</template>
