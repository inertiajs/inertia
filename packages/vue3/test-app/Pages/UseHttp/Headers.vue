<script setup lang="ts">
import { useHttp } from '@inertiajs/vue3'
import { ref } from 'vue'

interface HeadersResponse {
  headers: Record<string, string>
  method: string
}

const headersTest = useHttp<{ data: string }, HeadersResponse>({
  data: 'test',
})

const lastHeadersResponse = ref<HeadersResponse | null>(null)

const performHeadersTest = async () => {
  try {
    const result = await headersTest.post('/api/headers', {
      headers: {
        'X-Custom-Header': 'custom-value',
        'X-Another-Header': 'another-value',
      },
    })
    lastHeadersResponse.value = result
  } catch (e) {
    console.error('Headers test failed:', e)
  }
}
</script>

<template>
  <div>
    <h1>useHttp Headers Test</h1>

    <!-- Headers Test -->
    <section id="headers-test">
      <h2>Custom Headers</h2>
      <button @click="performHeadersTest" id="headers-button">Send with Custom Headers</button>
      <div v-if="lastHeadersResponse" id="headers-result">
        Custom Header Received: {{ lastHeadersResponse.headers['x-custom-header'] || 'none' }}
        <br />
        Another Header: {{ lastHeadersResponse.headers['x-another-header'] || 'none' }}
        <br />
        Content-Type: {{ lastHeadersResponse.headers['content-type'] || 'none' }}
      </div>
    </section>
  </div>
</template>
