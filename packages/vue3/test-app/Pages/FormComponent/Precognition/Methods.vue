<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <h1>Form Precognition - Touch, Reset & Validate</h1>

    <Form
      action="/precognition/default"
      method="post"
      :validation-timeout="100"
      #default="{ invalid, errors, validate, touch, touched, validating, reset }"
    >
      <div>
        <input name="name" placeholder="Name" @blur="touch('name')" />
        <p v-if="invalid('name')">
          {{ errors.name }}
        </p>
      </div>

      <div>
        <input name="email" placeholder="Email" @blur="touch('email')" />
        <p v-if="invalid('email')">
          {{ errors.email }}
        </p>
      </div>

      <p v-if="validating">Validating...</p>

      <p id="name-touched">{{ touched('name') ? 'Name is touched' : 'Name is not touched' }}</p>
      <p id="email-touched">{{ touched('email') ? 'Email is touched' : 'Email is not touched' }}</p>
      <p id="any-touched">{{ touched() ? 'Form has touched fields' : 'Form has no touched fields' }}</p>

      <button type="button" @click="validate()">Validate All Touched</button>
      <button type="button" @click="validate('name')">Validate Name</button>
      <button type="button" @click="validate({ only: ['name', 'email'] })">Validate Name and Email</button>
      <button type="button" @click="touch('name', 'email')">Touch Name and Email</button>
      <button
        type="button"
        @click="
          () => {
            touch('name')
            touch('name')
          }
        "
      >
        Touch Name Twice
      </button>
      <button type="button" @click="reset()">Reset All</button>
      <button type="button" @click="reset('name')">Reset Name</button>
      <button type="button" @click="reset('name', 'email')">Reset Name and Email</button>
    </Form>
  </div>
</template>
