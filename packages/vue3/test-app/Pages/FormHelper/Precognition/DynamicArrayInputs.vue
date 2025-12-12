<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'

const form = useForm({
  items: [] as Array<{ name: string }>,
})
  .withPrecognition('post', '/precognition/dynamic-array-inputs')
  .setValidationTimeout(100)

function addItem() {
  form.items.push({ name: '' })
}
</script>

<template>
  <div>
    <button id="add-item" @click="addItem">Add Item</button>

    <div v-for="(item, idx) in form.items" :key="idx">
      <input v-model="item.name" :name="`items.${idx}.name`" @blur="form.validate(`items.${idx}.name`)" />
      <p v-if="form.invalid(`items.${idx}.name`)" :id="`items.${idx}.name-error`">{{ form.errors[`items.${idx}.name`] }}</p>
      <p v-if="form.valid(`items.${idx}.name`)">Valid!</p>
    </div>

    <p v-if="form.validating">Validating...</p>
  </div>
</template>
