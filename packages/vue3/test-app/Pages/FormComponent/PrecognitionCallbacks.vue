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
  </div>
</template>
