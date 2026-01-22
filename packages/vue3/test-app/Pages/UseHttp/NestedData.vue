<script setup lang="ts">
import { useHttp } from '@inertiajs/vue3'
import { ref } from 'vue'

interface NestedResponse {
  success: boolean
  received: Record<string, any>
}

const nestedData = useHttp<
  {
    user: {
      name: string
      address: {
        city: string
        zip: string
      }
    }
    tags: string[]
  },
  NestedResponse
>({
  user: {
    name: '',
    address: {
      city: '',
      zip: '',
    },
  },
  tags: [],
})

const lastNestedResponse = ref<NestedResponse | null>(null)

const performNestedTest = async () => {
  try {
    const result = await nestedData.post('/api/nested')
    lastNestedResponse.value = result
  } catch (e) {
    console.error('Nested test failed:', e)
  }
}
</script>

<template>
  <div>
    <h1>useHttp Nested Data Test</h1>

    <!-- Nested Data Test -->
    <section id="nested-test">
      <h2>Nested Data</h2>
      <label>
        User Name
        <input type="text" id="nested-user-name" v-model="nestedData.user.name" />
      </label>
      <label>
        City
        <input type="text" id="nested-city" v-model="nestedData.user.address.city" />
      </label>
      <label>
        Zip
        <input type="text" id="nested-zip" v-model="nestedData.user.address.zip" />
      </label>
      <label>
        Tags (comma-separated)
        <input
          type="text"
          id="nested-tags"
          @input="(e) => (nestedData.tags = (e.target as HTMLInputElement).value.split(',').map((t) => t.trim()))"
        />
      </label>
      <button @click="performNestedTest" id="nested-button">Submit Nested Data</button>
      <div v-if="lastNestedResponse" id="nested-result">
        Received: {{ JSON.stringify(lastNestedResponse.received) }}
      </div>
    </section>
  </div>
</template>
