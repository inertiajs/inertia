<script setup lang="ts">
import { FormComponentRef } from '@inertiajs/core'
import { Form } from '@inertiajs/vue3'
import { ref } from 'vue'

const formRef = ref<FormComponentRef>()

const handleSetDefaults = () => {
  formRef.value!.defaults()
}
</script>

<template>
  <div>
    <h1>Precognition - Defaults Updates Validator</h1>

    <Form
      ref="formRef"
      action="/form-component/precognition"
      method="post"
      :validate-timeout="100"
      #default="{ invalid, errors, validate, validating }"
    >
      <div>
        <input id="name-input" name="name" placeholder="Name" />
        <p v-if="invalid('name')" class="error">
          {{ errors.name }}
        </p>
      </div>

      <p v-if="validating" class="validating">Validating...</p>

      <button type="button" @click="handleSetDefaults">Set Defaults</button>
      <button type="button" @click="validate('name')">Validate Name</button>
      <button type="submit">Submit</button>
    </Form>
  </div>
</template>
