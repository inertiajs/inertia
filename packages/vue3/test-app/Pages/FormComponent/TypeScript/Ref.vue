<!-- This component is used for checking the TypeScript implementation; there is no Playwright test depending on it. -->
<script setup lang="ts">
import { FormComponentRef } from '@inertiajs/core'
import { Form } from '@inertiajs/vue3'
import { ref } from 'vue'

interface UserForm {
  name: string
  email: string
}

const formRef = ref<FormComponentRef<UserForm> | null>(null)
</script>

<template>
  <div>
    <Form ref="formRef" action="/users" method="post">
      <input name="name" />
      <input name="email" />
      <button type="submit">Submit</button>
    </Form>

    <button @click="formRef?.clearErrors('name')">Clear name error</button>
    <button @click="formRef?.reset('email')">Reset email</button>

    <!-- @vue-expect-error - 'invalid_field' should not be a valid key -->
    <button @click="formRef?.clearErrors('invalid_field')">Invalid</button>
  </div>
</template>
