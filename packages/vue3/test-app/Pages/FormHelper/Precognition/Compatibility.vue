<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import { NamedInputEvent } from 'laravel-precognition'

const form = useForm({
  name: '',
  email: '',
  company: '',
})
  .withPrecognition('post', '/precognition/default')
  .setValidationTimeout(100)
</script>

<template>
  <div>
    <h1>Compatibility Test Page</h1>

    <div>
      <input v-model="form.name" name="name" placeholder="Name" @blur="form.validate('name')" />
      <p v-if="form.invalid('name')" id="name-error">{{ form.errors.name }}</p>
      <p v-if="form.valid('name')" id="name-valid">Name is valid!</p>
    </div>

    <div>
      <input v-model="form.email" name="email" placeholder="Email" @blur="form.validate('email')" />
      <p v-if="form.invalid('email')" id="email-error">{{ form.errors.email }}</p>
      <p v-if="form.valid('email')" id="email-valid">Email is valid!</p>
    </div>

    <div>
      <input
        v-model="form.company"
        name="company"
        placeholder="Company"
        @focus="
          (e) => {
            const event = e as any as NamedInputEvent // eslint-disable-line @typescript-eslint/no-explicit-any
            form.forgetError(event)
            form.touch(event)
          }
        "
        @blur="form.validate('company')"
      />
      <p v-if="form.invalid('company')" id="company-error">{{ form.errors.company }}</p>
      <p v-if="form.valid('company')" id="company-valid">company is valid!</p>
    </div>

    <p v-if="form.validating" id="validating">Validating...</p>

    <!-- Test compatibility methods -->
    <div style="margin-top: 20px">
      <button
        type="button"
        id="test-setErrors"
        @click="
          form.setErrors({ name: 'setErrors test', email: 'setErrors email test', company: 'setErrors company test' })
        "
      >
        Test setErrors()
      </button>

      <button type="button" id="test-forgetError" @click="form.forgetError('name')">Test forgetError()</button>

      <button type="button" id="test-touch-array" @click="form.touch(['name', 'email'])">Test touch([])</button>

      <button type="button" id="test-touch-spread" @click="form.touch('name', 'email')">Test touch(...args)</button>
    </div>

    <div style="margin-top: 20px">
      <p id="touched-name">Name touched: {{ form.touched('name') ? 'yes' : 'no' }}</p>
      <p id="touched-email">Email touched: {{ form.touched('email') ? 'yes' : 'no' }}</p>
      <p id="touched-company">Company touched: {{ form.touched('company') ? 'yes' : 'no' }}</p>
      <p id="touched-any">Any touched: {{ form.touched() ? 'yes' : 'no' }}</p>
    </div>
  </div>
</template>
