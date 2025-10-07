<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
import { ref } from 'vue'

const blockedFirst = ref(false)
const blockedSecond = ref(false)

const handleBeforeValidationFirst = () => {
  blockedFirst.value = true
  return false
}

const handleBeforeValidationSecond = () => {
  blockedSecond.value = true
  return false
}
</script>

<template>
  <div>
    <h1>Precognition - onBeforeValidation Per Call</h1>

    <Form action="/form-component/precognition" method="post" #default="{ validate, validating }">
      <p v-if="validating" class="validating">Validating...</p>
      <p v-if="blockedFirst" class="blocked-first">Blocked by first callback</p>
      <p v-if="blockedSecond" class="blocked-second">Blocked by second callback</p>

      <div>
        <input id="name-input" name="name" />
      </div>

      <!-- This button uses first callback -->
      <button
        type="button"
        @click="
          validate('name', {
            onBeforeValidation: handleBeforeValidationFirst,
          })
        "
      >
        Validate with First
      </button>

      <!-- This button uses second callback -->
      <button
        type="button"
        @click="
          validate('name', {
            onBeforeValidation: handleBeforeValidationSecond,
          })
        "
      >
        Validate with Second
      </button>

      <button type="submit">Submit</button>
    </Form>
  </div>
</template>
