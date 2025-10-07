<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
import { ref } from 'vue'

const exceptionCaught = ref(false)
const exceptionMessage = ref('')

const handleException = (error: Error) => {
  exceptionCaught.value = true
  exceptionMessage.value = error.message || 'Unknown error'
}
</script>

<template>
  <div>
    <h1>Precognition - onException</h1>

    <Form action="/form-component/precognition-exception" method="post" #default="{ validate, validating }">
      <p v-if="validating" class="validating">Validating...</p>
      <p v-if="exceptionCaught" class="exception-caught">Exception caught: {{ exceptionMessage }}</p>

      <div>
        <input id="name-input" name="name" />
      </div>

      <!-- This will trigger a validation request to a non-existent endpoint -->
      <button
        type="button"
        @click="
          validate('name', {
            onException: handleException,
          })
        "
      >
        Validate with Exception Handler
      </button>

      <button type="submit">Submit</button>
    </Form>
  </div>
</template>
