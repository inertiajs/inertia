<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'

const form = useForm({
  name: '',
  email: '',
})
  .withPrecognition('post', '/precognition/with-all-errors')
  .setValidationTimeout(100)
  .withAllErrors()
</script>

<template>
  <div>
    <div>
      <input v-model="form.name" name="name" placeholder="Name" @blur="form.validate('name')" />
      <div v-if="form.invalid('name')">
        <template v-if="Array.isArray(form.errors.name)">
          <p v-for="(error, index) in form.errors.name" :key="index" :id="`name-error-${index}`">
            {{ error }}
          </p>
        </template>
        <p v-else id="name-error-0">{{ form.errors.name }}</p>
      </div>
      <p v-if="form.valid('name')">Name is valid!</p>
    </div>

    <div>
      <input v-model="form.email" name="email" placeholder="Email" @blur="form.validate('email')" />
      <div v-if="form.invalid('email')">
        <template v-if="Array.isArray(form.errors.email)">
          <p v-for="(error, index) in form.errors.email" :key="index" :id="`email-error-${index}`">
            {{ error }}
          </p>
        </template>
        <p v-else id="email-error-0">{{ form.errors.email }}</p>
      </div>
      <p v-if="form.valid('email')">Email is valid!</p>
    </div>

    <p v-if="form.validating">Validating...</p>
  </div>
</template>
