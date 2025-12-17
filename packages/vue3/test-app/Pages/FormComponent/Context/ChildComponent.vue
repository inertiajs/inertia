<script setup lang="ts">
import { useFormContext } from '@inertiajs/vue3'

const props = defineProps<{
  formId?: string
}>()

const form = useFormContext()
</script>

<template>
  <div v-if="form" :id="formId ? `${formId}-child-state` : 'child-state'">
    <span>Child: Form is {{ form.isDirty ? 'dirty' : 'clean' }}</span>
    <span v-if="form.hasErrors"> | Child: Form has errors</span>
    <span v-if="form.errors.name" :id="formId ? undefined : 'child_error_name'"> | Error: {{ form.errors.name }}</span>
  </div>
  <div v-else id="child-no-context">No form context available</div>

  <button type="button" :id="formId ? `${formId}-set-error` : 'child-set-error-button'" @click="form?.setError('name', formId ? 'Error from child' : 'Error set from child component')">
    Set Error
  </button>
  <button type="button" :id="formId ? `${formId}-clear-error` : 'child-clear-errors-button'" @click="form?.clearErrors('name')">
    Clear Error
  </button>
  <button v-if="!formId" type="button" id="child-submit-button" @click="form?.submit()">Submit from Child</button>
  <button v-if="!formId" type="button" id="child-reset-button" @click="form?.reset()">Reset from Child</button>
  <button v-if="!formId" type="button" id="child-defaults-button" @click="form?.defaults()">Set Defaults</button>
</template>
