<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
import { computed, ref } from 'vue'

const events = ref<string[]>([])
const cancelInOnBefore = ref(false)
const shouldFail = ref(false)
const shouldDelay = ref(false)

let cancelToken: { cancel: () => void } | null = null

function log(eventName: string) {
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
</script>

<template>
  <Form
    :action="action"
    method="post"
    v-bind="formEvents()"
    v-slot="{ processing, progress, wasSuccessful, recentlySuccessful }"
  >
    <h1>Form Events & State</h1>

    <div>
      Events: <span id="events">{{ events.join(',') }}</span>
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
      <button type="button" @click="shouldFail = true">Fail Request</button>
      <button type="button" @click="shouldDelay = true">Should Delay</button>
      <button type="button" @click="cancelVisit">Cancel Visit</button>
      <button type="submit">Submit</button>
    </div>
  </Form>
</template>
