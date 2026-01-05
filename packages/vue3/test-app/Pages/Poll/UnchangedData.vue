<script setup lang="ts">
import { usePoll } from '@inertiajs/vue3'

usePoll(500, {
  only: ['custom_prop'],
})
</script>

<template>
  <div />
</template>
