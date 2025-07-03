<script setup>
import { Form } from '@inertiajs/vue3'
import { computed, ref } from 'vue'

const events = ref([])
const cancelInOnBefore = ref(false)
const shouldFail = ref(false)
const shouldDelay = ref(false)

let cancelToken = null

function log(eventName) {
  events.value.push(eventName)
}

const action = computed(() => {
  if (shouldFail.value) {
    return '/form-component/events/errors'
  }

  if (shouldDelay.value) {
    return '/form-component/events/delay'
  }

  return '/form-component/events/success'
})

function formEvents() {
  return {
    onBefore: () => {
      log('onBefore')

      if (cancelInOnBefore.value) {
        log('onCancel')
        return false
      }
    },
    onStart: () => log('onStart'),
    onProgress: () => log('onProgress'),
    onFinish: () => log('onFinish'),
    onCancel: () => log('onCancel'),
    onSuccess: () => log('onSuccess'),
    onError: () => log('onError'),
    onCancelToken: (token) => {
      log('onCancelToken')
      cancelToken = token
    },
  }
}

function cancelVisit() {
  if (cancelToken) {
    cancelToken.cancel()
    cancelToken = null
  }
}
</script>

<template>
  <Form :action="action" method="post" v-bind="formEvents()">
    <h1>Form Events</h1>

    <div id="events">{{ events.join(',') }}</div>

    <div>
      <input type="file" name="avatar" id="avatar" />
    </div>

    <div>
      <button type="button" @click="cancelInOnBefore = true">Cancel in onBefore</button>
      <button type="button" @click="shouldFail = true">Fail Request</button>
      <button type="button" @click="shouldDelay = true">Use Cancel Token</button>
      <button type="button" @click="cancelVisit">Cancel Visit</button>
      <button type="submit">Submit</button>
    </div>
  </Form>
</template>
