<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
import { ref } from 'vue'

const successCalled = ref(false)
const errorCalled = ref(false)
const finishCalled = ref(false)
</script>

<template>
  <div>
    <h1>Form Precognition Callbacks & Exceptions</h1>

    <h2>Callbacks Test</h2>
    <Form action="/form-component/precognition" method="post" :validateTimeout="100">
      <template #default="{ validate, validating, touch }">
        <div>
          <input name="name" placeholder="Name" @blur="() => touch('name')" />
        </div>

        <p v-if="validating">Validating...</p>
        <p v-if="successCalled">onSuccess called!</p>
        <p v-if="errorCalled">onError called!</p>
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
          Validate with onError
        </button>
      </template>
    </Form>
  </div>
</template>
