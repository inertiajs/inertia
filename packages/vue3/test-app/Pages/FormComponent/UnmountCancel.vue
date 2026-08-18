<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
import { ref } from 'vue'

defineProps<{ cancelOnUnmount: boolean }>()

const events = ref<string[]>([])
const showModal = ref(true)

function log(eventName: string) {
  events.value.push(eventName)
}

const closeOnSuccess = ref(false)

const formEvents = {
  onBefore: () => log('onBefore'),
  onStart: () => log('onStart'),
  onFinish: () => log('onFinish'),
  onCancel: () => log('onCancel'),
  onCancelToken: () => log('onCancelToken'),
  onSuccess: async () => {
    log('onSuccess')

    if (closeOnSuccess.value) {
      showModal.value = false

      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  },
}
</script>

<template>
  <div>
    <h1>Form Unmount Cancel</h1>

    <div>
      Events: <span id="events">{{ events.join(',') }}</span>
    </div>

    <div v-if="showModal">
      <Form
        :action="`/form-component/unmount-cancel/${cancelOnUnmount ? 'yes' : 'no'}`"
        method="post"
        :cancel-on-unmount="cancelOnUnmount"
        v-bind="formEvents"
      >
        <input type="text" name="name" value="John" />

        <button type="submit">Submit</button>
      </Form>
    </div>

    <button type="button" @click="showModal = false">Close Modal</button>
    <button type="button" @click="closeOnSuccess = true">Close On Success</button>
  </div>
</template>
