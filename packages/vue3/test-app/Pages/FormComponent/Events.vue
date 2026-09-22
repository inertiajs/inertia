<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
import { onMounted, ref } from 'vue'

const events = ref<string[]>([])
const globalEvents = ref<string[]>([])
const flashData = ref('')
const cancelInOnBefore = ref(false)
const preventErrorEvents = ref(false)
const action = ref('/form-component/events/success')

let cancelToken: { cancel: () => void } | null = null

function log(eventName: string) {
  events.value.push(eventName)
}

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
    onHttpException: () => {
      log('onHttpException')

      if (preventErrorEvents.value) {
        return false
      }
    },
    onNetworkError: () => {
      log('onNetworkError')

      if (preventErrorEvents.value) {
        return false
      }
    },
    onFlash: (flash: Record<string, unknown>) => {
      log('onFlash')
      flashData.value = JSON.stringify(flash)
    },
    onCancelToken: (token: { cancel: () => void }) => {
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

onMounted(() => {
  document.addEventListener('inertia:httpException', () => globalEvents.value.push('httpException'))
  document.addEventListener('inertia:networkError', () => globalEvents.value.push('networkError'))
})
</script>

<template>
  <Form
    :action="action"
    method="post"
    v-bind="formEvents()"
    v-slot="{ processing, progress, wasSuccessful, recentlySuccessful, cancel }"
  >
    <h1>Form Events & State</h1>

    <div>
      Events: <span id="events">{{ events.join(',') }}</span>
    </div>

    <div>
      Global events: <span id="global-events">{{ globalEvents.join(',') }}</span>
    </div>

    <div>
      Flash: <span id="flash">{{ flashData }}</span>
    </div>

    <div>
      Processing: <span id="processing">{{ processing }}</span>
    </div>

    <div>
      Progress:
      <span id="progress" :class="progress?.percentage ? 'uploading' : undefined">{{ progress?.percentage || 0 }}</span>
    </div>

    <div>
      Was successful: <span id="was-successful">{{ wasSuccessful }}</span>
    </div>

    <div>
      Recently successful: <span id="recently-successful">{{ recentlySuccessful }}</span>
    </div>

    <div>
      <input type="file" name="avatar" id="avatar" />
    </div>

    <div>
      <button type="button" @click="cancelInOnBefore = true">Cancel in onBefore</button>
      <button type="button" @click="action = '/form-component/events/errors'">Fail Request</button>
      <button type="button" @click="action = '/form-component/events/delay'">Should Delay</button>
      <button type="button" @click="action = '/form-component/events/flash'">Return Flash</button>
      <button type="button" @click="action = '/non-inertia'">Trigger HTTP Exception</button>
      <button type="button" @click="action = '/disconnect'">Trigger Network Error</button>
      <button type="button" @click="preventErrorEvents = true">Prevent Error Events</button>
      <button type="button" @click="cancelVisit">Cancel Visit</button>
      <button type="button" @click="cancel">Cancel Submission</button>
      <button type="submit">Submit</button>
    </div>
  </Form>
</template>
