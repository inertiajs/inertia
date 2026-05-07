<script setup lang="ts">
import { usePoll } from '@inertiajs/vue3'

defineProps<{ mode: string; time: number }>()

const params = new URLSearchParams(window.location.search)
const interval = parseInt(params.get('interval') || '200')
const timeout = params.get('timeout') ? parseInt(params.get('timeout')!) : undefined

const pathMode = window.location.pathname.split('/').pop()

const options: { overlap?: 'allow' | 'skip' | 'cancel' } = {}

if (pathMode === 'skip') {
  options.overlap = 'skip'
}

if (pathMode === 'cancel') {
  options.overlap = 'cancel'
}

if (pathMode === 'allow') {
  options.overlap = 'allow'
}

const requestOptions: { timeout?: number } = {}

if (timeout !== undefined) {
  requestOptions.timeout = timeout
}

usePoll(interval, requestOptions, options)
</script>

<template>
  <div>
    <span id="mode">{{ mode }}</span>
    <span id="time">{{ time }}</span>
  </div>
</template>
