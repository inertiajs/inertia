<script setup lang="ts">
import { useHttp } from '@inertiajs/vue3'
import { ref } from 'vue'

interface TransformResponse {
  success: boolean
  received: Record<string, unknown>
}

const transformTest = useHttp<{ name: string; email: string }, TransformResponse>({
  name: '',
  email: '',
})

const lastTransformResponse = ref<TransformResponse | null>(null)

const performTransform = async () => {
  try {
    transformTest.transform((data) => ({
      transformed_name: data.name.toUpperCase(),
      transformed_email: data.email.toLowerCase(),
      original_name: data.name,
    }))
    const result = await transformTest.post('/api/transform')
    lastTransformResponse.value = result
  } catch (e) {
    console.error('Transform failed:', e)
  }
}
</script>

<template>
  <div>
    <h1>useHttp Transform Test</h1>

    <!-- Transform Test -->
    <section id="transform-test">
      <h2>Transform</h2>
      <label>
        Name
        <input type="text" id="transform-name" v-model="transformTest.name" />
      </label>
      <label>
        Email
        <input type="email" id="transform-email" v-model="transformTest.email" />
      </label>
      <button @click="performTransform" id="transform-button">Submit with Transform</button>
      <div v-if="lastTransformResponse" id="transform-result">
        Transformed Name: {{ lastTransformResponse.received.transformed_name }}
        <br />
        Transformed Email: {{ lastTransformResponse.received.transformed_email }}
        <br />
        Original Name: {{ lastTransformResponse.received.original_name }}
      </div>
    </section>
  </div>
</template>
