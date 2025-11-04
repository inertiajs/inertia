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
      <input name="name" v-model="form.name" placeholder="Name" @blur="form.touch('name')" />
      <p v-if="form.invalid('name')">
        {{ form.errors.name }}
      </p>
    </div>

    <div>
      <input name="email" v-model="form.email" placeholder="Email" @blur="form.touch('email')" />
      <p v-if="form.invalid('email')">
        {{ form.errors.email }}
      </p>
    </div>

    <p v-if="form.validating">Validating...</p>

    <p id="name-touched">{{ form.touched('name') ? 'Name is touched' : 'Name is not touched' }}</p>
    <p id="email-touched">{{ form.touched('email') ? 'Email is touched' : 'Email is not touched' }}</p>
    <p id="any-touched">{{ form.touched() ? 'Form has touched fields' : 'Form has no touched fields' }}</p>

    <button type="button" @click="form.validate()">Validate All Touched</button>
    <button type="button" @click="form.validate('name')">Validate Name</button>
    <button type="button" @click="form.validate({ only: ['name', 'email'] })">Validate Name and Email</button>
    <button type="button" @click="form.touch('name', 'email')">Touch Name and Email</button>
    <button
      type="button"
      @click="
        () => {
          form.touch('name')
          form.touch('name')
        }
      "
    >
      Touch Name Twice
    </button>
    <button type="button" @click="form.reset()">Reset All</button>
    <button type="button" @click="form.reset('name')">Reset Name</button>
    <button type="button" @click="form.reset('name', 'email')">Reset Name and Email</button>
  </div>
</template>
