<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import { ref, watch } from 'vue'

const form = useForm<{
  name: string
  avatar: File | null
}>({
  name: '',
  avatar: null,
})
  .withPrecognition('post', '/precognition/files')
  .setValidationTimeout(100)

const validateFiles = ref(false)

watch(validateFiles, (enabled) => (enabled ? form.validateFiles() : form.withoutFileValidation()))
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
      <input
        type="file"
        name="avatar"
        id="avatar"
        @change="(e) => (form.avatar = (e.target as HTMLInputElement).files?.[0] || null)"
      />
      <p v-if="form.invalid('avatar')">
        {{ form.errors.avatar }}
      </p>
      <p v-if="form.valid('avatar')">Avatar is valid!</p>
    </div>

    <p v-if="form.validating">Validating...</p>

    <button type="button" @click="validateFiles = !validateFiles">
      Toggle Validate Files ({{ validateFiles ? 'enabled' : 'disabled' }})
    </button>

    <button type="button" @click="form.validate({ only: ['name', 'avatar'] })">Validate Both</button>
  </div>
</template>
