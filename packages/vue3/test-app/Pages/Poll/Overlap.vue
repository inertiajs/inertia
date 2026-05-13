<script setup lang="ts">
import { usePoll } from '@inertiajs/vue3'

defineProps<{ mode: string; time: number }>()

const params = new URLSearchParams(window.location.search)
const interval = parseInt(params.get('interval') || '200')

const pathMode = window.location.pathname.split('/').pop()

const options: { mode?: 'allow' | 'cancel' | 'rest' } = {}

if (pathMode === 'allow' || pathMode === 'cancel' || pathMode === 'rest') {
  options.mode = pathMode
}

usePoll(interval, {}, options)
</script>

<template>
  <div>
    <span id="mode">{{ mode }}</span>
    <span id="time">{{ time }}</span>
  </div>
</template>
