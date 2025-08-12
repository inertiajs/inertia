<script setup>
import { Form } from '@inertiajs/vue3'
import { ref } from 'vue'

const formRef = ref(null)

const submitProgrammatically = () => {
  formRef.value.submit()
}

const resetForm = () => {
  formRef.value.reset()
}

const checkDirtyState = () => {
  alert(`Form is dirty: ${formRef.value.isDirty}`)
}

const clearAllErrors = () => {
  formRef.value.clearErrors()
}

const setTestError = () => {
  formRef.value.setError('name', 'This is a test error')
}

const checkErrors = () => {
  const hasErrors = formRef.value.hasErrors
  const errors = formRef.value.errors
  alert(`Has errors: ${hasErrors}, Errors: ${JSON.stringify(errors)}`)
}
</script>

<template>
  <div>
    <h1>Form Ref Test</h1>

    <Form ref="formRef" action="/dump/post" method="post">
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
      <button @click="checkDirtyState">Check Dirty State</button>
      <button @click="clearAllErrors">Clear Errors</button>
      <button @click="setTestError">Set Test Error</button>
      <button @click="checkErrors">Check Errors</button>
    </div>
  </div>
</template>
