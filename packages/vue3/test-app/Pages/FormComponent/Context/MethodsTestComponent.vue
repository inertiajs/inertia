<script setup lang="ts">
import { useFormContext } from '@inertiajs/vue3'
import { ref } from 'vue'

const form = useFormContext()

const getDataResult = ref('')
const getFormDataResult = ref('')

function testGetData() {
  if (form) {
    getDataResult.value = JSON.stringify(form.getData(), null, 2)
  }
}

function testGetFormData() {
  if (form) {
    const formData = form.getFormData()
    const obj: Record<string, FormDataEntryValue> = {}
    formData.forEach((value, key) => {
      obj[key] = value
    })
    getFormDataResult.value = JSON.stringify(obj, null, 2)
  }
}
</script>

<template>
  <div v-if="form">
    <span id="child-is-dirty">{{ form.isDirty }}</span>
    <span id="child-has-errors">{{ form.hasErrors }}</span>
    <span id="child-processing">{{ form.processing }}</span>
    <span id="child-was-successful">{{ form.wasSuccessful }}</span>
    <span id="child-recently-successful">{{ form.recentlySuccessful }}</span>
    <pre v-if="form.hasErrors" id="child-errors">{{ JSON.stringify(form.errors, null, 2) }}</pre>

    <button type="button" id="child-submit" @click="form.submit()">submit()</button>
    <button type="button" id="child-reset-all" @click="form.reset()">reset()</button>
    <button type="button" id="child-reset-name" @click="form.reset('name')">reset('name')</button>
    <button type="button" id="child-reset-multiple" @click="form.reset('name', 'email')">reset('name', 'email')</button>

    <button type="button" id="child-clear-all-errors" @click="form.clearErrors()">clearErrors()</button>
    <button type="button" id="child-clear-name-error" @click="form.clearErrors('name')">clearErrors('name')</button>
    <button type="button" id="child-set-single-error" @click="form.setError('name', 'Name is invalid')">
      setError('name')
    </button>
    <button
      type="button"
      id="child-set-multiple-errors"
      @click="
        form.setError({
          name: 'Name error from child',
          email: 'Email error from child',
          bio: 'Bio error from child',
        })
      "
    >
      setError({...})
    </button>

    <button type="button" id="child-reset-clear-all" @click="form.resetAndClearErrors()">resetAndClearErrors()</button>
    <button type="button" id="child-reset-clear-name" @click="form.resetAndClearErrors('name')">
      resetAndClearErrors('name')
    </button>
    <button type="button" id="child-set-defaults" @click="form.defaults()">defaults()</button>

    <button type="button" id="child-get-data" @click="testGetData">getData()</button>
    <button type="button" id="child-get-form-data" @click="testGetFormData">getFormData()</button>

    <div v-if="getDataResult" id="get-data-result">
      <pre>{{ getDataResult }}</pre>
    </div>
    <div v-if="getFormDataResult" id="get-form-data-result">
      <pre>{{ getFormDataResult }}</pre>
    </div>
  </div>
  <div v-else id="child-no-context">No form context available</div>
</template>
