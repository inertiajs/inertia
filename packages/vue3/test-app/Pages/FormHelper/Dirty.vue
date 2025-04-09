<script setup>
import { useForm } from '@inertiajs/vue3'
const form = useForm({ name: 'foo', foo: [] })

const submit = () => {
  form.post('')
}

const defaults = () => {
  form.defaults()
}

const pushValue = () => {
  form.foo.push('bar')
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

    <button @click="defaults" class="defaults">Defaults</button>

    <button @click="pushValue" class="push">Push value</button>
  </div>
</template>
