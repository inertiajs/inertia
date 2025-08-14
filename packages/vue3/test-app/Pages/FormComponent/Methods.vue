<script setup lang="ts">
import { Form } from '@inertiajs/vue3'
import type { Method } from '@inertiajs/core'
import { ref } from 'vue'

const method = ref<Method>('get')
</script>

<template>
  <div>
    <h1>HTTP Methods</h1>

    <div>
      <button @click="method = 'get'">GET</button>
      <button @click="method = 'post'">POST</button>
      <button @click="method = 'put'">PUT</button>
      <button @click="method = 'patch'">PATCH</button>
      <button @click="method = 'delete'">DELETE</button>
    </div>

    <div>Current method: {{ method }}</div>

    <Form :action="`/dump/${method}`" :method="method">
      <div>
        <input type="text" name="name" placeholder="Name" value="John Doe" />
      </div>

      <div>
        <input type="checkbox" name="active" value="true" checked />
        <label>Active</label>
      </div>

      <div>
        <button type="submit">Submit {{ method.toUpperCase() }}</button>
      </div>
    </Form>
  </div>
</template>
