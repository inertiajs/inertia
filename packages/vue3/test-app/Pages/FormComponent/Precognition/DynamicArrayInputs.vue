<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
import { ref } from 'vue'

const items = ref<Array<{ name: string }>>([])

function addItem() {
  items.value.push({ name: '' })
}
</script>

<template>
  <div>
    <button id="add-item" @click="addItem">Add Item</button>

    <Form
      action="/precognition/dynamic-array-inputs"
      method="post"
      :validation-timeout="100"
      #default="{ invalid, errors, validate, validating }"
    >
      <div v-for="(item, idx) in items" :key="idx">
        <input v-model="item.name" :name="`items.${idx}.name`" @blur="validate(`items.${idx}.name`)" />
        <p v-if="invalid(`items.${idx}.name`)" :id="`items.${idx}.name-error`">{{ errors[`items.${idx}.name`] }}</p>
      </div>

      <p v-if="validating">Validating...</p>
    </Form>
  </div>
</template>
