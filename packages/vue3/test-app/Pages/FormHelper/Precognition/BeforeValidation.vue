<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import { isEqual } from 'lodash-es'

const form = useForm({
  name: '',
  email: '',
})
  .withPrecognition('post', '/precognition/default')
  .setValidationTimeout(100)

const handleBeforeValidation = (
  newRequest: { data: Record<string, unknown> | null; touched: string[] },
  oldRequest: { data: Record<string, unknown> | null; touched: string[] },
) => {
  const payloadIsCorrect =
    isEqual(newRequest, { data: { name: 'block' }, touched: ['name'] }) &&
    isEqual(oldRequest, { data: {}, touched: [] })

  if (payloadIsCorrect && newRequest.data?.name === 'block') {
    return false
  }

  return true
}
</script>

<template>
  <div>
    <div>
      <input
        v-model="form.name"
        name="name"
        placeholder="Name"
        @blur="
          form.validate('name', {
            onBeforeValidation: handleBeforeValidation,
          })
        "
      />
      <p v-if="form.invalid('name')">
        {{ form.errors.name }}
      </p>
      <p v-if="form.valid('name')">Name is valid!</p>
    </div>

    <div>
      <input v-model="form.email" name="email" placeholder="Email" @blur="form.validate('email')" />
      <p v-if="form.invalid('email')">
        {{ form.errors.email }}
      </p>
      <p v-if="form.valid('email')">Email is valid!</p>
    </div>

    <p v-if="form.validating">Validating...</p>
  </div>
</template>
