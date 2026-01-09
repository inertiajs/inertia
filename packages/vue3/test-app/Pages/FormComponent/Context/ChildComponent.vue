<script setup lang="ts">
import { useFormContext } from '@inertiajs/vue3'

defineProps<{
  formId?: string
}>()

const form = useFormContext()
</script>

<template>
  <div v-if="form">
    <span>Child: Form is {{ form.isDirty ? 'dirty' : 'clean' }}</span>
    <span v-if="form.hasErrors"> | Child: Form has errors</span>
    <span v-if="form.errors.name"> | Error: {{ form.errors.name }}</span>
  </div>
  <div v-else>No form context available</div>

  <button type="button" @click="form?.setError('name', formId ? 'Error from child' : 'Error set from child component')">
    Set Error
  </button>
  <button type="button" @click="form?.clearErrors('name')">Clear Error</button>
  <button v-if="!formId" type="button" @click="form?.submit()">Submit from Child</button>
  <button v-if="!formId" type="button" @click="form?.reset()">Reset from Child</button>
  <button v-if="!formId" type="button" @click="form?.defaults()">Set Defaults</button>
</template>
