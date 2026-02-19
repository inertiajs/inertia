<script setup lang="ts">
import { FormComponentMethods } from '@inertiajs/core'
import { Form, Head } from '@inertiajs/vue3'
import { ref } from 'vue'

const validateFiles = ref(false)
const validationTimeout = ref(1500)

const callbacks = ref({
  success: false,
  error: false,
  finish: false,
})

const validateWithCallbacks = (validate: FormComponentMethods['validate']) => {
  callbacks.value = { success: false, error: false, finish: false }

  validate({
    onPrecognitionSuccess: () => (callbacks.value.success = true),
    onValidationError: () => (callbacks.value.error = true),
    onFinish: () => (callbacks.value.finish = true),
    onBeforeValidation: (newReq) => {
      if (newReq.data?.name === 'block') {
        alert('Validation blocked by onBeforeValidation!')
        return false
      }
    },
  })
}
</script>

<template>
  <Head title="Form Component Precognition" />
  <h1 class="text-3xl">Form Component Precognition</h1>

  <Form
    action="/form-component/precognition"
    method="post"
    :validate-files="validateFiles"
    :validation-timeout="validationTimeout"
    #default="{ errors, invalid, valid, validate, validating, touch, touched, processing }"
    class="mt-6 max-w-2xl space-y-6"
  >
    <!-- Status Display -->
    <div class="rounded border border-gray-200 bg-gray-50 p-4">
      <h3 class="mb-3 text-lg font-medium">Validation Status (v-slot props)</h3>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          validating:
          <span class="font-mono" :class="validating ? 'text-blue-600' : 'text-gray-500'">{{ validating }}</span>
        </div>
        <div>
          processing:
          <span class="font-mono" :class="processing ? 'text-blue-600' : 'text-gray-500'">{{ processing }}</span>
        </div>
        <div>
          touched():
          <span class="font-mono" :class="touched() ? 'text-orange-600' : 'text-gray-500'">{{ touched() }}</span>
        </div>
        <div>
          touched('name'):
          <span class="font-mono" :class="touched('name') ? 'text-orange-600' : 'text-gray-500'">{{
            touched('name')
          }}</span>
        </div>
        <div>
          touched('email'):
          <span class="font-mono" :class="touched('email') ? 'text-orange-600' : 'text-gray-500'">{{
            touched('email')
          }}</span>
        </div>
      </div>
    </div>

    <!-- Form Fields -->
    <div class="space-y-4">
      <!-- Name Input -->
      <div>
        <label class="block font-medium" for="name">Name</label>
        <input
          type="text"
          name="name"
          id="name"
          placeholder="Enter your name (min 3 chars)"
          @blur="validate('name')"
          class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
          :class="invalid('name') ? 'border-red-500' : valid('name') ? 'border-green-500' : ''"
        />
        <div v-if="invalid('name')" class="mt-1 text-sm text-red-600">{{ errors.name }}</div>
        <div v-if="valid('name')" class="mt-1 text-sm text-green-600">Valid!</div>
      </div>

      <!-- Email Input -->
      <div>
        <label class="block font-medium" for="email">Email</label>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Enter your email"
          @blur="validate('email')"
          class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
          :class="invalid('email') ? 'border-red-500' : valid('email') ? 'border-green-500' : ''"
        />
        <div v-if="invalid('email')" class="mt-1 text-sm text-red-600">{{ errors.email }}</div>
        <div v-if="valid('email')" class="mt-1 text-sm text-green-600">Valid!</div>
      </div>

      <!-- File Input -->
      <div>
        <label class="block font-medium" for="avatar">Avatar</label>
        <input
          type="file"
          name="avatar"
          id="avatar"
          @change="validate('avatar')"
          class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
          :class="invalid('avatar') ? 'border-red-500' : valid('avatar') ? 'border-green-500' : ''"
        />
        <div v-if="invalid('avatar')" class="mt-1 text-sm text-red-600">{{ errors.avatar }}</div>
        <div v-if="valid('avatar')" class="mt-1 text-sm text-green-600">Valid!</div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-wrap gap-2">
      <button
        type="submit"
        :disabled="processing"
        class="rounded bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
      >
        Submit
      </button>

      <button type="button" @click="validate()" class="rounded border border-slate-300 px-4 py-2 hover:bg-slate-50">
        Validate Touched
      </button>

      <button type="button" @click="touch('name')" class="rounded border border-slate-300 px-4 py-2 hover:bg-slate-50">
        Touch Name
      </button>

      <button
        type="button"
        @click="validateWithCallbacks(validate)"
        class="rounded border border-slate-300 px-4 py-2 hover:bg-slate-50"
      >
        Validate with Callbacks
      </button>
    </div>

    <!-- Callbacks Display -->
    <div class="rounded border border-gray-200 bg-gray-50 p-4">
      <h3 class="mb-3 text-lg font-medium">Validation Callbacks</h3>
      <p class="mb-3 text-sm text-gray-600">Enter "block" in the name field to test onBeforeValidation blocking.</p>
      <div class="grid grid-cols-3 gap-4 text-sm">
        <div>
          onPrecognitionSuccess:
          <span class="font-mono" :class="callbacks.success ? 'text-green-600' : 'text-gray-500'">{{
            callbacks.success
          }}</span>
        </div>
        <div>
          onValidationError:
          <span class="font-mono" :class="callbacks.error ? 'text-red-600' : 'text-gray-500'">{{
            callbacks.error
          }}</span>
        </div>
        <div>
          onFinish:
          <span class="font-mono" :class="callbacks.finish ? 'text-blue-600' : 'text-gray-500'">{{
            callbacks.finish
          }}</span>
        </div>
      </div>
    </div>
  </Form>

  <!-- Configuration -->
  <div class="mt-8 max-w-2xl space-y-4">
    <h2 class="text-2xl">Configuration</h2>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div class="rounded border border-gray-200 bg-gray-50 p-4">
        <div class="space-y-1 text-sm">
          <div>
            <strong>Validate Files:</strong> <code>{{ validateFiles }}</code>
          </div>
          <div>
            <strong>Validation Timeout:</strong> <code>{{ validationTimeout }}ms</code>
          </div>
          <div><strong>Method:</strong> <code>POST</code></div>
        </div>
      </div>

      <div class="space-y-3">
        <div>
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="validateFiles" class="rounded" />
            <span class="text-sm">Enable file validation</span>
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium">Validation Timeout</label>
          <select v-model="validationTimeout" class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm">
            <option :value="500">500ms</option>
            <option :value="1000">1000ms</option>
            <option :value="1500">1500ms</option>
            <option :value="2000">2000ms</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>
