<script setup lang="ts">
import { usePoll } from '@inertiajs/vue3'

const props = defineProps<{ mode: string; time: number }>()

const params = new URLSearchParams(window.location.search)
const interval = parseInt(params.get('interval') || '200')

const options: { mode?: 'overlap' | 'cancel' | 'rest' } = {}

if (props.mode === 'overlap' || props.mode === 'cancel' || props.mode === 'rest') {
  options.mode = props.mode
}

usePoll(interval, {}, options)
</script>

<template>
  <div>
    <span id="mode">{{ mode }}</span>
    <span id="time">{{ time }}</span>
  </div>
</template>
