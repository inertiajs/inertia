<script lang="ts">
import Layout from '../Components/Layout.vue'
export default { layout: Layout }
</script>

<script setup lang="ts">
import { FormComponentMethods } from '@inertiajs/core'
import { Form, Head } from '@inertiajs/vue3'
import { ref } from 'vue'

const callbacks = ref({
  success: false,
  error: false,
  finish: false,
})

const validateWithCallbacks = (validate: FormComponentMethods['validate']) => {
  callbacks.value = {
    success: false,
    error: false,
    finish: false,
  }

  validate({
    onPrecognitionSuccess: () => (callbacks.value.success = true),
    onValidationError: () => (callbacks.value.error = true),
    onFinish: () => (callbacks.value.finish = true),
    onBeforeValidation: (newReq, oldReq) => {
      // Prevent validation if name is 'block'
      if (newReq.data?.name === 'block') {
        alert('Validation blocked by onBefore!')
        return false
      }
    },
  })
}

const validateFiles = ref(false)
const validationTimeout = ref(1500)
</script>

<template>
  <Head title="Precognition" />
  <h1 class="text-3xl">Form Precognition</h1>

  <!-- Live Validation & File Uploads -->
  <div class="mt-6 max-w-2xl space-y-6">
    <div class="rounded border border-gray-200 bg-gray-50 p-4">
      <h3 class="mb-3 text-lg font-medium">Live Validation & File Uploads</h3>

      <!-- Configuration Toggle -->
      <div class="mb-3 flex items-center gap-4">
        <label class="flex items-center gap-2">
          <input type="checkbox" v-model="validateFiles" class="rounded" />
          <span class="text-sm">Enable file validation</span>
        </label>
        <div class="flex items-center gap-2">
          <label class="text-sm">Timeout:</label>
          <select v-model="validationTimeout" class="rounded border px-2 py-1 text-sm">
            <option :value="500">500ms</option>
            <option :value="1000">1000ms</option>
            <option :value="1500">1500ms</option>
            <option :value="2000">2000ms</option>
          </select>
        </div>
      </div>

      <Form
        action="/precognition/default"
        method="post"
        :validate-files="validateFiles"
        :validation-timeout="validationTimeout"
        #default="{ errors, invalid, valid, validate, validating }"
        class="space-y-4"
      >
        <p class="text-sm text-blue-600">Validating: {{ validating ? 'Yes...' : 'No' }}</p>

        <div>
          <label for="name" class="block font-medium">Name</label>
          <input
            id="name"
            name="name"
            placeholder="Enter your name (min 3 chars)"
            @blur="validate('name')"
            class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
            :class="invalid('name') ? 'border-red-500' : valid('name') ? 'border-green-500' : ''"
          />
          <p v-if="invalid('name')" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
          <p v-if="valid('name')" class="mt-1 text-sm text-green-600">Valid!</p>
        </div>

        <div>
          <label for="email" class="block font-medium">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            @blur="validate('email')"
            class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
            :class="invalid('email') ? 'border-red-500' : valid('email') ? 'border-green-500' : ''"
          />
          <p v-if="invalid('email')" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
          <p v-if="valid('email')" class="mt-1 text-sm text-green-600">Valid!</p>
        </div>

        <div>
          <label for="avatar" class="block font-medium">Avatar</label>
          <input
            id="avatar"
            name="avatar"
            type="file"
            @change="validate('avatar')"
            class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
            :class="invalid('avatar') ? 'border-red-500' : valid('avatar') ? 'border-green-500' : ''"
          />
          <p v-if="invalid('avatar')" class="mt-1 text-sm text-red-600">{{ errors.avatar }}</p>
          <p v-if="valid('avatar')" class="mt-1 text-sm text-green-600">Valid!</p>
          <p class="mt-1 text-xs text-gray-500">
            Files are validated during precognitive requests when validateFiles is enabled
          </p>
        </div>
      </Form>
    </div>

    <!-- Touch & Reset Methods -->
    <div class="rounded border border-gray-200 bg-gray-50 p-4">
      <h3 class="mb-3 text-lg font-medium">Touch & Reset Methods</h3>

      <Form
        action="/precognition/default"
        method="post"
        #default="{ errors, invalid, validate, touch, touched, reset, validating }"
        class="space-y-4"
      >
        <div>
          <label for="name2" class="block font-medium">Name</label>
          <input
            id="name2"
            name="name"
            placeholder="Name"
            @blur="touch('name')"
            class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
          />
          <p v-if="invalid('name')" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
          <p class="mt-1 text-xs text-gray-500">Touched: {{ touched('name') }}</p>
        </div>

        <div>
          <label for="email2" class="block font-medium">Email</label>
          <input
            id="email2"
            name="email"
            type="email"
            placeholder="Email"
            @blur="touch('email')"
            class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
          />
          <p v-if="invalid('email')" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
          <p class="mt-1 text-xs text-gray-500">Touched: {{ touched('email') }}</p>
        </div>

        <p v-if="validating" class="text-sm text-blue-600">Validating...</p>

        <div class="flex flex-wrap gap-2">
          <button type="button" @click="validate()" class="rounded bg-blue-600 px-3 py-1.5 text-sm text-white">
            Validate
          </button>
          <button type="button" @click="reset()" class="rounded bg-gray-600 px-3 py-1.5 text-sm text-white">
            Reset All
          </button>
          <button type="button" @click="reset('name')" class="rounded bg-gray-600 px-3 py-1.5 text-sm text-white">
            Reset Name
          </button>
        </div>

        <div class="rounded bg-gray-100 p-3 text-sm">
          <strong>Status:</strong>
          <ul class="mt-2 space-y-1 text-xs">
            <li>Any field touched: {{ touched() }}</li>
            <li>Name touched: {{ touched('name') }}</li>
            <li>Email touched: {{ touched('email') }}</li>
          </ul>
        </div>
      </Form>
    </div>

    <!-- Validation Callbacks -->
    <div class="rounded border border-gray-200 bg-gray-50 p-4">
      <h3 class="mb-3 text-lg font-medium">Validation Callbacks</h3>

      <Form action="/precognition/default" method="post" class="space-y-4">
        <template #default="{ errors, invalid, validate, touch, validating }">
          <div>
            <label for="name3" class="block font-medium">Name</label>
            <input
              id="name3"
              name="name"
              placeholder="Enter 'block' to prevent validation"
              @blur="touch('name')"
              class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
            />
            <p v-if="invalid('name')" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
          </div>

          <p v-if="validating" class="text-sm text-blue-600">Validating...</p>

          <div v-if="callbacks.success || callbacks.error || callbacks.finish" class="rounded bg-gray-100 p-3">
            <p v-if="callbacks.success" class="text-sm text-green-600">onPrecognitionSuccess called!</p>
            <p v-if="callbacks.error" class="text-sm text-red-600">onValidationError called!</p>
            <p v-if="callbacks.finish" class="text-sm text-blue-600">onFinish called!</p>
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              @click="validateWithCallbacks(validate)"
              class="rounded bg-blue-600 px-3 py-1.5 text-sm text-white"
            >
              Validate
            </button>
          </div>
        </template>
      </Form>
    </div>
  </div>
</template>
