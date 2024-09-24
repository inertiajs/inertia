<script setup>
import { Link, usePoll } from '@inertiajs/vue3'

usePoll(500, {
  only: ['custom_prop'],
  onFinish() {
    console.log('hook poll finished')
  },
})
</script>

<template>
  <Link href="/">Home</Link>
</template>
