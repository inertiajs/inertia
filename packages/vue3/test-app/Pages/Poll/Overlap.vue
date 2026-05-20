<script setup lang="ts">
import { usePoll } from '@inertiajs/vue3'

const props = defineProps<{ mode: string; time: number }>()

const params = new URLSearchParams(window.location.search)
const interval = parseInt(params.get('interval') || '200')

const options: { mode?: 'overlap' | 'cancel' | 'rest'; keepAlive?: boolean } = {}

if (props.mode === 'overlap' || props.mode === 'cancel' || props.mode === 'rest') {
  options.mode = props.mode
}

if (params.get('keepAlive') === '1') {
  options.keepAlive = true
}

const { start, stop } = usePoll(interval, {}, options)
</script>

<template>
  <div>
    <span id="mode">{{ mode }}</span>
    <span id="time">{{ time }}</span>
    <button @click="stop">Stop</button>
    <button @click="start">Start</button>
  </div>
</template>
