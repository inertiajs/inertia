<script setup>
import { useForm } from '@inertiajs/vue3'
const form = useForm({ name: 'foo' })

const submit = () => {
  form.post('')
}
</script>

<template>
  <div>
    <div>Form is <span v-if="form.isDirty">dirty</span><span v-else>clean</span></div>
    <label>
      Full Name
      <input type="text" id="name" name="name" v-model="form.name" />
    </label>

    <button @click="submit" class="submit">Submit form</button>
  </div>
</template>
