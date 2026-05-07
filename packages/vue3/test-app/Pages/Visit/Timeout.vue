<script setup lang="ts">
import { router } from '@inertiajs/vue3'
import { ref } from 'vue'

const status = ref('idle')
const cancelFired = ref(false)
const timeoutFired = ref(false)

const visit = (timeout: number | string = 300) => {
  status.value = 'pending'
  cancelFired.value = false
  timeoutFired.value = false
  router.visit('/visit/timeout/slow?delay=2000', {
    timeout,
    onTimeout: () => {
      timeoutFired.value = true
      status.value = 'timed-out'
    },
    onCancel: () => {
      cancelFired.value = true
    },
    onSuccess: () => {
      status.value = 'success'
    },
  })
}

const visitMs = () => visit(1500)
const visitString = () => visit('300ms')
</script>

<template>
  <button id="visit" @click="visitMs">Visit</button>
  <button id="visit-string" @click="visitString">Visit (string)</button>
  <span id="status">{{ status }}</span>
  <span id="cancel-fired">{{ cancelFired ? 'yes' : 'no' }}</span>
  <span id="timeout-fired">{{ timeoutFired ? 'yes' : 'no' }}</span>
</template>
