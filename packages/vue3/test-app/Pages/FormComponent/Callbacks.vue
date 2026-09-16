<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
import { ref } from 'vue'

const events = ref<string[]>([])
const cancelErrors = ref(true)

function log(event: string) {
  events.value.push(event)
}
</script>

<template>
  <Form
    action="/form-component/callbacks"
    method="post"
    :onBeforeUpdate="(page) => log(`onBeforeUpdate:${page.component}`)"
    :onHttpException="
      (response) => {
        log(`onHttpException:${response.status}`)
        return cancelErrors ? false : undefined
      }
    "
    :onNetworkError="
      (error) => {
        log(`onNetworkError:${error instanceof Error}`)
        return cancelErrors ? false : undefined
      }
    "
    :onFlash="(flash) => log(`onFlash:${JSON.stringify(flash)}`)"
    @success="log('onSuccess')"
    @error="log('onError')"
    @finish="log('onFinish')"
    v-slot="{ processing }"
  >
    <label><input type="checkbox" v-model="cancelErrors" /> Cancel errors</label>
    <pre id="events">{{ events.join('\n') }}</pre>
    <span id="processing">{{ processing }}</span>
    <button type="submit">Submit</button>
  </Form>
</template>
