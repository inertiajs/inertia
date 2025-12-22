<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'

const form = useForm({
  name: '',
  email: '',
})
  .withPrecognition('post', '/precognition/default')
  .setValidationTimeout(100)
</script>

<template>
  <div>
    <div>
      <input v-model="form.name" name="name" placeholder="Name" @blur="form.validate('name')" />
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
