<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
defineProps<{
  disable: boolean
}>()
</script>

<template>
  <div>
    <h1>Form Disable While Processing Test</h1>

    <Form
      method="post"
      :action="`/form-component/disable-while-processing/${disable ? 'yes' : 'no'}/submit`"
      :disable-while-processing="disable"
    >
      <div>
        <input type="text" name="name" placeholder="Name" value="John Doe" />
      </div>

      <div>
        <button type="submit">Submit</button>
      </div>
    </Form>
  </div>
</template>
