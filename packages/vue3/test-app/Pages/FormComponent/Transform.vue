<script setup lang="ts">
import type { FormDataConvertible } from '@inertiajs/core'
import { Form } from '@inertiajs/vue3'
import { computed, ref } from 'vue'

const transformType = ref('none')

const transformFunction = computed(() => {
  switch (transformType.value) {
    case 'uppercase':
      return (data: Record<string, FormDataConvertible>) => ({
        ...data,
        name: typeof data.name === 'string' ? data.name.toUpperCase() : data.name,
      })
    case 'format':
      return (data: Record<string, FormDataConvertible>) => ({
        ...data,
        fullName: `${data.firstName} ${data.lastName}`,
      })
    default:
      return (data: Record<string, FormDataConvertible>) => data
  }
})
</script>

<template>
  <div>
    <h1>Transform Function</h1>

    <div>
      <button @click="transformType = 'none'">None</button>
      <button @click="transformType = 'uppercase'">Uppercase</button>
      <button @click="transformType = 'format'">Format</button>
    </div>

    <div>Current transform: {{ transformType }}</div>

    <Form action="/dump/post" method="post" :transform="transformFunction">
      <div>
        <input type="text" name="name" placeholder="Name" value="John Doe" />
      </div>

      <div>
        <input type="text" name="firstName" placeholder="First Name" value="John" />
      </div>

      <div>
        <input type="text" name="lastName" placeholder="Last Name" value="Doe" />
      </div>

      <div>
        <button type="submit">Submit with Transform</button>
      </div>
    </Form>
  </div>
</template>
