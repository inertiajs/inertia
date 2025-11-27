<script setup lang="ts">
import { useFormContext } from '@inertiajs/vue3'
import { ref } from 'vue'

const form = useFormContext()

// State for displaying method results
const getDataResult = ref<string>('')
const getFormDataResult = ref<string>('')

const testSubmit = () => {
  form?.submit()
}

const testResetAll = () => {
  form?.reset()
}

const testResetName = () => {
  form?.reset('name')
}

const testResetMultiple = () => {
  form?.reset('name', 'email')
}

const testClearAllErrors = () => {
  form?.clearErrors()
}

const testClearNameError = () => {
  form?.clearErrors('name')
}

const testSetSingleError = () => {
  form?.setError('name', 'Name is invalid (set from child)')
}

const testSetMultipleErrors = () => {
  form?.setError({
    name: 'Name error from child',
    email: 'Email error from child',
    bio: 'Bio error from child',
  })
}

const testResetAndClearErrors = () => {
  form?.resetAndClearErrors()
}

const testResetAndClearNameError = () => {
  form?.resetAndClearErrors('name')
}

const testSetDefaults = () => {
  form?.defaults()
}

const testGetData = () => {
  if (form) {
    const data = form.getData()
    getDataResult.value = JSON.stringify(data, null, 2)
  }
}

const testGetFormData = () => {
  if (form) {
    const formData = form.getFormData()
    const obj: Record<string, any> = {}
    formData.forEach((value, key) => {
      obj[key] = value
    })
    getFormDataResult.value = JSON.stringify(obj, null, 2)
  }
}
</script>

<template>
  <div id="methods-test-component" style="border: 2px solid orange; padding: 15px; margin: 15px 0">
    <h3>Methods Test Component (using useFormContext)</h3>

    <div v-if="form" id="child-methods-state">
      <!-- Display current state -->
      <div style="background: #f0f0f0; padding: 10px; margin: 10px 0">
        <h4>Current State from Context</h4>
        <ul>
          <li>
            isDirty: <span id="child-is-dirty">{{ form.isDirty }}</span>
          </li>
          <li>
            hasErrors: <span id="child-has-errors">{{ form.hasErrors }}</span>
          </li>
          <li>
            processing: <span id="child-processing">{{ form.processing }}</span>
          </li>
          <li>
            wasSuccessful: <span id="child-was-successful">{{ form.wasSuccessful }}</span>
          </li>
          <li>
            recentlySuccessful: <span id="child-recently-successful">{{ form.recentlySuccessful }}</span>
          </li>
          <li v-if="form.hasErrors">
            Errors:
            <pre id="child-errors">{{ JSON.stringify(form.errors, null, 2) }}</pre>
          </li>
        </ul>
      </div>

      <!-- Submit and Reset Methods -->
      <div style="margin: 10px 0">
        <h4>Submit & Reset</h4>
        <button type="button" @click="testSubmit" id="child-submit">submit()</button>
        <button type="button" @click="testResetAll" id="child-reset-all">reset()</button>
        <button type="button" @click="testResetName" id="child-reset-name">reset('name')</button>
        <button type="button" @click="testResetMultiple" id="child-reset-multiple">reset('name', 'email')</button>
      </div>

      <!-- Error Methods -->
      <div style="margin: 10px 0">
        <h4>Error Management</h4>
        <button type="button" @click="testClearAllErrors" id="child-clear-all-errors">clearErrors()</button>
        <button type="button" @click="testClearNameError" id="child-clear-name-error">clearErrors('name')</button>
        <button type="button" @click="testSetSingleError" id="child-set-single-error">setError('name', 'error')</button>
        <button type="button" @click="testSetMultipleErrors" id="child-set-multiple-errors">setError({...})</button>
      </div>

      <!-- Combined Methods -->
      <div style="margin: 10px 0">
        <h4>Combined Methods</h4>
        <button type="button" @click="testResetAndClearErrors" id="child-reset-clear-all">resetAndClearErrors()</button>
        <button type="button" @click="testResetAndClearNameError" id="child-reset-clear-name">
          resetAndClearErrors('name')
        </button>
        <button type="button" @click="testSetDefaults" id="child-set-defaults">defaults()</button>
      </div>

      <!-- Data Retrieval Methods -->
      <div style="margin: 10px 0">
        <h4>Data Retrieval</h4>
        <button type="button" @click="testGetData" id="child-get-data">getData()</button>
        <button type="button" @click="testGetFormData" id="child-get-form-data">getFormData()</button>

        <div v-if="getDataResult" id="get-data-result" style="background: #e8f5e9; padding: 5px; margin: 5px 0">
          <strong>getData() result:</strong>
          <pre>{{ getDataResult }}</pre>
        </div>

        <div
          v-if="getFormDataResult"
          id="get-form-data-result"
          style="background: #e3f2fd; padding: 5px; margin: 5px 0"
        >
          <strong>getFormData() result:</strong>
          <pre>{{ getFormDataResult }}</pre>
        </div>
      </div>
    </div>

    <div v-else id="child-no-context">⚠ No form context available</div>
  </div>
</template>

<style scoped>
button {
  margin: 2px;
  padding: 5px 10px;
  font-size: 12px;
}
</style>
