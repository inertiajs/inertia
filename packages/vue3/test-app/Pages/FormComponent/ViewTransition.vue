<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
</script>

<template>
  <Form
    action="/form-component/view-transition"
    method="post"
    :options="{
      viewTransition: (viewTransition: ViewTransition) => {
        viewTransition.ready.then(() => console.log('ready'))
        viewTransition.updateCallbackDone.then(() => console.log('updateCallbackDone'))
        viewTransition.finished.then(() => console.log('finished'))
      },
    }"
  >
    <button type="submit">Submit with View Transition</button>
  </Form>
</template>
