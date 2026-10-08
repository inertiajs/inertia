<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <h1>Form Submit On Enter</h1>

    <Form action="/dump/post" method="post" v-slot="{ submit }">
      <textarea name="message" id="message" @keydown.enter.exact.prevent="submit()"></textarea>
    </Form>
  </div>
</template>
