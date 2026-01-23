<script setup lang="ts">
import { Link, useHttp } from '@inertiajs/vue3'

const form = useHttp('useHttpRemember', {
  name: 'initial',
  email: '',
})
</script>

<template>
  <div>
    <h1>useHttp Remember Test</h1>

    <label>
      Name
      <input type="text" id="name" v-model="form.name" />
    </label>

    <label>
      Email
      <input type="text" id="email" v-model="form.email" />
    </label>

    <div id="current-values">Name: {{ form.name }}, Email: {{ form.email }}</div>
    <div id="is-dirty">isDirty: {{ form.isDirty }}</div>

    <Link href="/dump/get" id="navigate-away">Navigate away</Link>
  </div>
</template>
