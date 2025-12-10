<script setup lang="ts">
import { useFormContext } from '@inertiajs/vue3'
import { computed } from 'vue'

const form = useFormContext()

// Test that we can use computed properties with the context
const formData = computed(() => {
  if (!form) return null
  return form.getData()
})

const dataDisplay = computed(() => {
  if (!formData.value) return 'No data'
  return JSON.stringify(formData.value, null, 2)
})
</script>

<template>
  <div id="deeply-nested-component" style="border: 2px solid purple; padding: 10px; margin: 10px 0">
    <h4>Deeply Nested Component (using useFormContext)</h4>

    <div v-if="form" id="deeply-nested-state">
      <div>Deeply Nested: Form is <span v-if="form.isDirty">dirty</span><span v-else>clean</span></div>
      <div v-if="form.hasErrors">Deeply Nested: Form has errors ({{ Object.keys(form.errors).length }})</div>
      <div v-if="form.processing">Deeply Nested: Form is processing</div>

      <details>
        <summary>Form Data (from getData())</summary>
        <pre id="form-data-display">{{ dataDisplay }}</pre>
      </details>
    </div>

    <div v-if="!form" id="deeply-nested-no-context">No form context available in deeply nested component</div>
  </div>
</template>
