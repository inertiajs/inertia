<script setup>
import { Form } from '@inertiajs/vue3'
import { ref } from 'vue'

const headers = ref({
  'X-Foo': 'Bar',
})

function addCustomHeader() {
  headers.value['X-Custom'] = 'MyCustomValue'
}
</script>

<template>
  <Form action="/dump/post" method="post" :headers="headers">
    <h1>Form Headers</h1>

    <div>
      <button type="button" @click="addCustomHeader">Add Custom Header</button>
    </div>

    <button type="submit">Submit</button>
  </Form>
</template>
