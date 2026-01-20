<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
import { ref } from 'vue'

const successCalled = ref(false)
const errorCalled = ref(false)
const finishCalled = ref(false)
</script>

<template>
  <div>
    <h1>Form Precognition Callbacks</h1>

    <h2>Callbacks Test</h2>
    <Form action="/precognition/default" method="post" :validationTimeout="100">
      <template #default="{ validate, validating, touch }">
        <div>
          <input name="name" placeholder="Name" @blur="() => touch('name')" />
        </div>

        <p v-if="validating">Validating...</p>
        <p v-if="successCalled">onPrecognitionSuccess called!</p>
        <p v-if="errorCalled">onValidationError called!</p>
        <p v-if="finishCalled">onFinish called!</p>

        <button
          type="button"
          @click="
            () => {
              successCalled = false
              errorCalled = false
              finishCalled = false
              validate({
                onPrecognitionSuccess: () => {
                  successCalled = true
                },
                onValidationError: () => {
                  errorCalled = true
                },
                onFinish: () => {
                  finishCalled = true
                },
              })
            }
          "
        >
          Validate
        </button>
      </template>
    </Form>
  </div>
</template>
