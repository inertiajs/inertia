<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import { ref } from 'vue'

const form = useForm({
  name: '',
  email: '',
})
  .withPrecognition('post', '/precognition/default')
  .setValidationTimeout(100)

const successCalled = ref(false)
const errorCalled = ref(false)
const finishCalled = ref(false)
</script>

<template>
  <div>
    <div>
      <input v-model="form.name" name="name" placeholder="Name" @blur="form.touch('name')" />
      <p v-if="form.invalid('name')">
        {{ form.errors.name }}
      </p>
      <p v-if="form.valid('name')">Name is valid!</p>
    </div>

    <p v-if="form.validating">Validating...</p>
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
          form.validate({
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
  </div>
</template>
