<script setup lang="ts">
import { Form, Head } from '@inertiajs/vue3'
import { ref } from 'vue'

defineProps({
  foo: Number,
  bar: Number,
  quux: Number,
})

const customHeaders = ref({ 'X-Custom-Header': 'Demo-Value' })
const errorBag = ref('custom-bag')
</script>

<template>
  <Head title="Form Component" />
  <h1 class="text-3xl">Form Component</h1>

  <!-- Main Demo Form -->
  <Form
    action="/form-component"
    method="post"
    :headers="customHeaders"
    :error-bag="errorBag"
    :transform="(data) => ({ ...data, demo: 'data' })"
    :options="{
      only: ['foo'],
      reset: ['bar'],
    }"
    #default="{
      errors,
      hasErrors,
      processing,
      progress,
      wasSuccessful,
      recentlySuccessful,
      setError,
      clearErrors,
      isDirty,
      reset,
      submit,
    }"
    class="mt-6 max-w-2xl space-y-6"
  >
    <!-- Status Display -->
    <div class="rounded border border-gray-200 bg-gray-50 p-4">
      <h3 class="mb-3 text-lg font-medium">Form Status (v-slot props)</h3>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          isDirty: <span class="font-mono" :class="isDirty ? 'text-orange-600' : 'text-gray-500'">{{ isDirty }}</span>
        </div>
        <div>
          hasErrors:
          <span class="font-mono" :class="hasErrors ? 'text-red-600' : 'text-gray-500'">{{ hasErrors }}</span>
        </div>
        <div>
          processing:
          <span class="font-mono" :class="processing ? 'text-blue-600' : 'text-gray-500'">{{ processing }}</span>
        </div>
        <div>
          wasSuccessful:
          <span class="font-mono" :class="wasSuccessful ? 'text-green-600' : 'text-gray-500'">{{ wasSuccessful }}</span>
        </div>
        <div>
          recentlySuccessful:
          <span class="font-mono" :class="recentlySuccessful ? 'text-green-600' : 'text-gray-500'">{{
            recentlySuccessful
          }}</span>
        </div>
        <div v-if="progress">
          progress: <span class="font-mono text-blue-600">{{ Math.round(progress.percentage) }}%</span>
        </div>
      </div>
    </div>

    <div v-if="isDirty" class="rounded border border-amber-100 bg-amber-50 p-3 text-amber-800">
      There are unsaved changes!
    </div>

    <!-- Form Fields -->
    <div class="space-y-4">
      <!-- Text Input -->
      <div>
        <label class="block font-medium" for="name">Name</label>
        <input
          type="text"
          name="name"
          id="name"
          placeholder="Enter your name"
          class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
          :class="errors.name ? 'border-red-500' : ''"
        />
        <div v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</div>
      </div>

      <!-- File Input -->
      <div>
        <label class="block font-medium" for="avatar">Avatar</label>
        <input
          type="file"
          name="avatar"
          id="avatar"
          class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
        />
        <div v-if="errors.avatar" class="mt-1 text-sm text-red-600">{{ errors.avatar }}</div>
      </div>

      <!-- Multiple Select -->
      <div>
        <label class="block font-medium" for="skills">Skills (Multiple)</label>
        <select
          name="skills[]"
          id="skills"
          multiple
          class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
        >
          <option value="vue">Vue.js</option>
          <option value="react">React</option>
          <option value="laravel">Laravel</option>
          <option value="tailwind">Tailwind CSS</option>
        </select>
        <div v-if="errors['skills']" class="mt-1 text-sm text-red-600">{{ errors['skills'] }}</div>
      </div>

      <!-- Array Input (Tags) -->
      <div>
        <label class="block font-medium">Tags</label>
        <div class="mt-1 space-y-2">
          <input
            type="text"
            name="tags[]"
            placeholder="Tag 1"
            class="w-full appearance-none rounded border px-2 py-1 shadow-sm"
          />
          <div v-if="errors['tags.0']" class="text-sm text-red-600">{{ errors['tags.0'] }}</div>
          <input
            type="text"
            name="tags[]"
            placeholder="Tag 2"
            class="w-full appearance-none rounded border px-2 py-1 shadow-sm"
          />
          <div v-if="errors['tags.1']" class="text-sm text-red-600">{{ errors['tags.1'] }}</div>
        </div>
      </div>

      <!-- Nested Object Input -->
      <div>
        <label class="block font-medium">Address</label>
        <div class="mt-1 grid grid-cols-2 gap-2">
          <input
            type="text"
            name="user[address][street]"
            placeholder="Street"
            class="appearance-none rounded border px-2 py-1 shadow-sm"
          />
          <input
            type="text"
            name="user[address][city]"
            placeholder="City"
            class="appearance-none rounded border px-2 py-1 shadow-sm"
          />
        </div>
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

      <button type="button" @click="reset()" class="rounded bg-gray-500 px-4 py-2 text-white">Reset</button>

      <button
        type="button"
        @click="setError({ name: 'Name is required', avatar: 'Please select a file' })"
        class="rounded bg-red-500 px-4 py-2 text-white"
      >
        Set Errors
      </button>

      <button type="button" @click="clearErrors()" class="rounded bg-green-500 px-4 py-2 text-white">
        Clear Errors
      </button>
    </div>
  </Form>

  <!-- Form Configuration -->
  <div class="mt-8 max-w-2xl space-y-4">
    <h2 class="text-2xl">Form Configuration</h2>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div class="rounded border border-gray-200 bg-gray-50 p-4">
        <div class="space-y-1 text-sm">
          <div>
            <strong>Headers:</strong> <code class="text-xs">{{ JSON.stringify(customHeaders) }}</code>
          </div>
          <div>
            <strong>Error Bag:</strong> <code>{{ errorBag }}</code>
          </div>
          <div><strong>Only:</strong> <code>['foo']</code></div>
          <div><strong>Reset:</strong> <code>['bar']</code></div>
          <div><strong>Method:</strong> <code>POST</code></div>
        </div>
      </div>

      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium">Error Bag</label>
          <input
            type="text"
            v-model="errorBag"
            class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
            placeholder="Error bag name"
          />
        </div>

        <div>
          <label class="block text-sm font-medium">Custom Header Value</label>
          <input
            type="text"
            v-model="customHeaders['X-Custom-Header']"
            class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
            placeholder="Header value"
          />
        </div>
      </div>
    </div>
  </div>
</template>
