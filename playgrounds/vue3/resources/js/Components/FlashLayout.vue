<script setup lang="ts">
import { router } from '@inertiajs/vue3'
import { ref } from 'vue'
import Layout from './Layout.vue'

const flashLog = ref<Record<string, unknown>[]>([])

router.on('flash', (event) => {
  flashLog.value.push(event.detail.flash)
})
</script>

<template>
  <Layout>
    <slot />

    <div class="mt-8 border-t pt-6">
      <h2 class="text-lg font-semibold text-red-600">Flash Events (from Layout)</h2>
      <pre class="mt-2 rounded-sm bg-red-50 p-3 text-sm">{{ flashLog.length ? flashLog : 'No flash events yet' }}</pre>
      <p class="mt-2 text-sm text-gray-600">
        Layout flash event count: <strong>{{ flashLog.length }}</strong>
      </p>
    </div>
  </Layout>
</template>
