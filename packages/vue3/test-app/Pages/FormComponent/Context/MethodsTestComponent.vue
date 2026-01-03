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
    <span>{{ form.isDirty }}</span>
    <span>{{ form.hasErrors }}</span>
    <span>{{ form.processing }}</span>
    <span>{{ form.wasSuccessful }}</span>
    <span>{{ form.recentlySuccessful }}</span>
    <pre v-if="form.hasErrors">{{ JSON.stringify(form.errors, null, 2) }}</pre>

    <button type="button" @click="form.submit()">submit()</button>
    <button type="button" @click="form.reset()">reset()</button>
    <button type="button" @click="form.reset('name')">reset('name')</button>
    <button type="button" @click="form.reset('name', 'email')">reset('name', 'email')</button>

    <button type="button" @click="form.clearErrors()">clearErrors()</button>
    <button type="button" @click="form.clearErrors('name')">clearErrors('name')</button>
    <button type="button" @click="form.setError('name', 'Name is invalid')">setError('name')</button>
    <button
      type="button"
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

    <button type="button" @click="form.resetAndClearErrors()">resetAndClearErrors()</button>
    <button type="button" @click="form.resetAndClearErrors('name')">resetAndClearErrors('name')</button>
    <button type="button" @click="form.defaults()">defaults()</button>

    <button type="button" @click="testGetData">getData()</button>
    <button type="button" @click="testGetFormData">getFormData()</button>

    <div v-if="getDataResult">
      <pre>{{ getDataResult }}</pre>
    </div>
    <div v-if="getFormDataResult">
      <pre>{{ getFormDataResult }}</pre>
    </div>
  </div>
  <div v-else>No form context available</div>
</template>
