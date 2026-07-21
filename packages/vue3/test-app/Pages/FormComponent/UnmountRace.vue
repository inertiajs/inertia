<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
import { ref } from 'vue'

const show = ref(true)
</script>

<template>
  <div>
    <h1>Form Unmount Race</h1>

    <Form v-if="show" action="/dump/post" method="post">
      <input type="text" name="name" id="name" value="John" />
    </Form>

    <button id="hide" @click="show = false">Hide Form</button>
  </div>
</template>
