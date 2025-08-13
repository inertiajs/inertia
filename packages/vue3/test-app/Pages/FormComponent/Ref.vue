<script setup lang="ts">
import { FormComponentRef } from '@inertiajs/core'
import { Form } from '@inertiajs/vue3'
import { ref } from 'vue'

const formRef = ref<FormComponentRef | null>(null)

const submitProgrammatically = () => {
  formRef.value?.submit()
}

const resetForm = () => {
  formRef.value?.reset()
}

const resetNameField = () => {
  formRef.value?.reset('name')
}

const clearAllErrors = () => {
  formRef.value?.clearErrors()
}

const setTestError = () => {
  formRef.value?.setError('name', 'This is a test error')
}
</script>

<template>
  <div>
    <h1>Form Ref Test</h1>

    <Form ref="formRef" action="/dump/post" method="post" #default="{ isDirty, hasErrors, errors }">
      <!-- State display for testing -->
      <div>Form is <span v-if="isDirty">dirty</span><span v-else>clean</span></div>
      <div v-if="hasErrors">Form has errors</div>
      <div v-if="errors.name" id="error_name">{{ errors.name }}</div>

      <div>
        <input type="text" name="name" placeholder="Name" value="John Doe" />
      </div>

      <div>
        <input type="email" name="email" placeholder="Email" value="john@example.com" />
      </div>

      <div>
        <button type="submit">Submit via Form</button>
      </div>
    </Form>

    <div>
      <button @click="submitProgrammatically">Submit Programmatically</button>
      <button @click="resetForm">Reset Form</button>
      <button @click="resetNameField">Reset Name Field</button>
      <button @click="clearAllErrors">Clear Errors</button>
      <button @click="setTestError">Set Test Error</button>
    </div>
  </div>
</template>
