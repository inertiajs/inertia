<script setup lang="ts">
import { useFormContext } from '@inertiajs/vue3'

const form = useFormContext()

const submitFromChild = () => {
  form?.submit()
}

const resetFromChild = () => {
  form?.reset()
}

const clearErrorsFromChild = () => {
  form?.clearErrors()
}

const setTestError = () => {
  form?.setError('name', 'Error set from child component')
}

const setDefaultsFromChild = () => {
  form?.defaults()
}
</script>

<template>
  <div id="child-component" style="border: 2px solid blue; padding: 10px; margin: 10px 0">
    <h3>Child Component (using useFormContext)</h3>

    <div v-if="form" id="child-state">
      <div>Child: Form is <span v-if="form.isDirty">dirty</span><span v-else>clean</span></div>
      <div v-if="form.hasErrors">Child: Form has errors</div>
      <div v-if="form.processing">Child: Form is processing</div>
      <div v-if="form.errors.name" id="child_error_name">Child Error: {{ form.errors.name }}</div>
      <div v-if="form.wasSuccessful" id="child_was_successful">Child: Form was successful</div>
      <div v-if="form.recentlySuccessful" id="child_recently_successful">Child: Form recently successful</div>
    </div>

    <div v-if="!form" id="child-no-context">No form context available</div>

    <div style="margin-top: 10px">
      <button type="button" @click="submitFromChild" id="child-submit-button">Submit from Child</button>
      <button type="button" @click="resetFromChild" id="child-reset-button">Reset from Child</button>
      <button type="button" @click="clearErrorsFromChild" id="child-clear-errors-button">
        Clear Errors from Child
      </button>
      <button type="button" @click="setTestError" id="child-set-error-button">Set Error from Child</button>
      <button type="button" @click="setDefaultsFromChild" id="child-defaults-button">Set Defaults from Child</button>
    </div>
  </div>
</template>
