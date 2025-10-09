<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
import { isEqual } from 'lodash-es'

const handleBeforeValidation = (
  newRequest: { data: Record<string, any>; touched: string[] },
  oldRequest: { data: Record<string, any>; touched: string[] },
) => {
  const payloadIsCorrect =
    isEqual(newRequest, { data: { name: 'block' }, touched: ['name'] }) &&
    isEqual(oldRequest, { data: {}, touched: [] })

  if (payloadIsCorrect && newRequest.data.name === 'block') {
    return false
  }

  return true
}
</script>

<template>
  <div>
    <h1>Precognition - onBeforeValidation</h1>

    <Form
      action="/form-component/precognition"
      method="post"
      #default="{ errors, invalid, validate, validating }"
      :validate-timeout="100"
    >
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

      <button type="submit">Submit</button>
    </Form>
  </div>
</template>
