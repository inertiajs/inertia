<template>
  <div>
    <h1>Precognition - onBeforeValidation</h1>

    <Form action="/form-component/precognition" method="post" #default="{ errors, invalid, validate, validating }">
      <div>
        <label for="name">Name:</label>
        <input
          id="name"
          name="name"
          @change="
            validate('name', {
              onBeforeValidation: handleBeforeValidation,
            })
          "
        />
        <p v-if="invalid('name')" class="error">{{ errors.name }}</p>
      </div>

      <div>
        <label for="email">Email:</label>
        <input id="email" name="email" @change="validate('email')" />
        <p v-if="invalid('email')" class="error">{{ errors.email }}</p>
      </div>

      <p v-if="validating" class="validating">Validating...</p>
      <p v-if="blocked" class="blocked">Validation blocked by onBeforeValidation</p>
      <p v-if="dataCorrect" class="data-correct">Data structure is correct</p>

      <button type="submit">Submit</button>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
import { ref } from 'vue'

const blocked = ref(false)
const dataCorrect = ref(false)

const handleBeforeValidation = (
  newRequest: { data: Record<string, any>; touched: string[] },
  oldRequest: { data: Record<string, any>; touched: string[] },
) => {
  // Verify the data structure is correct
  const hasNewData = typeof newRequest.data === 'object' && newRequest.data !== null
  const hasNewTouched = Array.isArray(newRequest.touched)
  const hasOldData = typeof oldRequest.data === 'object' && oldRequest.data !== null
  const hasOldTouched = Array.isArray(oldRequest.touched)
  const hasNameField = 'name' in newRequest.data
  const touchedContainsName = newRequest.touched.includes('name')

  dataCorrect.value = hasNewData && hasNewTouched && hasOldData && hasOldTouched && hasNameField && touchedContainsName

  // Block validation if name is "block"
  if (newRequest.data.name === 'block') {
    blocked.value = true
    return false
  }

  blocked.value = false
  return true
}
</script>
