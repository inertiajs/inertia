<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
import { ref } from 'vue'

const successCalled = ref(false)
const errorCalled = ref(false)
const finishCalled = ref(false)
const exceptionCaught = ref(false)
const exceptionMessage = ref('')

const handleException = (error: Error) => {
  exceptionCaught.value = true
  exceptionMessage.value = error.message || 'Unknown error'
}
</script>

<template>
  <div>
    <h1>Form Precognition Callbacks & Exceptions</h1>

    <h2>Callbacks Test</h2>
    <Form action="/form-component/precognition" method="post" :validateTimeout="100">
      <template #default="{ validate, validating, touch }">
        <p v-if="validating">Validating...</p>
        <p v-if="successCalled">onSuccess called!</p>
        <p v-if="errorCalled">onError called!</p>
        <p v-if="finishCalled">onFinish called!</p>

        <div>
          <input name="name" @blur="() => touch('name')" />
        </div>

        <button
          type="button"
          @click="
            () => {
              successCalled = false
              errorCalled = false
              finishCalled = false
              validate({
                onSuccess: () => {
                  successCalled = true
                },
                onFinish: () => {
                  finishCalled = true
                },
              })
            }
          "
        >
          Validate with onSuccess
        </button>

        <button
          type="button"
          @click="
            () => {
              successCalled = false
              errorCalled = false
              finishCalled = false
              validate({
                onError: () => {
                  errorCalled = true
                },
                onFinish: () => {
                  finishCalled = true
                },
              })
            }
          "
        >
          Validate with onError
        </button>
      </template>
    </Form>

    <hr />

    <h2>Exception Test</h2>
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
