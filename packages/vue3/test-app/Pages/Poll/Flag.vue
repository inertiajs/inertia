<script setup lang="ts">
import { router, usePoll } from '@inertiajs/vue3'
import { ref } from 'vue'

const pollFlag = ref('pending')
const reloadFlag = ref('pending')

usePoll(500, {
  onFinish(visit) {
    pollFlag.value = String((visit as any).poll === true)
  },
})

const reload = () => {
  router.reload({
    onFinish(visit) {
      reloadFlag.value = String((visit as any).poll === true)
    },
  })
}
</script>

<template>
  <div id="poll-flag">poll: {{ pollFlag }}</div>
  <div id="reload-flag">reload: {{ reloadFlag }}</div>
  <button @click="reload">Reload</button>
</template>
