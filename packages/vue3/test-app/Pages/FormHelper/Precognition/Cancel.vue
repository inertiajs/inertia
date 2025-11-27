<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'

const form = useForm({
  name: '',
})
  .withPrecognition('post', '/precognition/default?slow=1')
  .setValidationTimeout(100)
</script>

<template>
  <div>
    <div>
      <input
        id="auto-cancel-name-input"
        v-model="form.name"
        name="name"
        placeholder="Name"
        @blur="form.validate('name')"
      />
      <p v-if="form.invalid('name')">
        {{ form.errors.name }}
      </p>
      <p v-if="form.valid('name')">Name is valid!</p>
    </div>

    <p v-if="form.validating">Validating...</p>
  </div>
</template>
